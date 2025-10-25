import puppeteer from "puppeteer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

  const { url, job_description } = await req.json(); // get url from request json body
  const browser = await puppeteer.launch({ headless: false }); // launch puppeteer with headless mode in false, see visible browser
  let page = (await browser.pages())[0] || await browser.newPage(); // if a tab is opened, use it, else open a new one
  await page.goto(url, { waitUntil: "networkidle0" }); // navigate open page/frame to url requested

//study : React ≥16, React attaches its own synthetic event handlers and caches values.
  function reactSafeSetValue(field, val) {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
    ).set;
    nativeInputValueSetter.call(field, val);
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }


  async function exposeFunction(page:puppeteer.Page) {
    try {
        await page.exposeFunction('onSpacebarPress',async (html: string)=>{ // a proxy is created per page and binding exposed to page context
            console.log('pressed')
            const res= await fetch(`${process.env.AIPPLY}`, {
                method:'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY}`},
                body: JSON.stringify({html, job_description})
            })
            const getaijson = await res.json();
            for (const item of getaijson) {
            const identifier = item.id || item.name;
            console.log(item)
            await page.evaluate(({ identifier, val }) => {
            // Try ID first
            let field = document.getElementById(identifier);

            // If no ID, try name
            if (!field) {
                field = document.querySelector(`[name="${identifier}"]`);
            }

            if (!field) return;

            const type = field.type;

            if (type === 'checkbox') {
                // val should be boolean for checkbox
                const shouldBeChecked = Boolean(val);
                if (field.checked !== shouldBeChecked) {
                    field.click();
                }
            } else if (type === 'radio') {
                // for radio, select the one with matching value
                const radios = document.querySelectorAll(`[name="${field.name}"]`);
                radios.forEach(r => {
                    if (r.value === val) {
                        r.checked = true;
                        r.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
            } else if (field.tagName === 'SELECT' && [...field.options].some(o => o.value === val)) {
                const optionExists = [...field.options].some(o => o.value === val);
                if (optionExists) {
                    field.value = val;
                    field.dispatchEvent(new Event('change', { bubbles: true }));
                }
            } else {
                reactSafeSetValue(field, val ?? '');
            }
            }, { identifier, val: item.value });
            }
        })
    } catch (err:any) {
        if (err.message.includes('already exists')) { // binding exists for page
            console.log('existing exposed func')
        } else {
            throw err;
        }
    }
    await page.evaluate(() => {
    if (!(window as any).onSpacebarListenerAdded) {
    document.addEventListener("keydown", async (event) => {
      if (event.code === "Space") {
        const htmlContent = document.documentElement.outerHTML;

        // Call the Node-exposed function
        // @ts-ignore
        await window.onSpacebarPress(htmlContent);
      }
    });
    (window as any).onSpacebarListenerAdded = true;
  }
});

  }

  await exposeFunction(page); // initial page exposed!!
  
  page.on("framenavigated", async () => { // navigated: reattach DOM listener
    console.log('navigated')
    await exposeFunction(page);
  });

  browser.on("targetcreated", async (target) => { // new page -> reattach DOM listener + new Node->page binding
    const newPage = await target.page();
    if (!newPage) return;
    await newPage.waitForNavigation({ waitUntil: "domcontentloaded" }).catch(() => {});
    await exposeFunction(newPage);
    newPage.on("framenavigated", async () => await exposeFunction(newPage));
  });

  return NextResponse.json({ status: "browser opened, waiting for spacebar" });
}
