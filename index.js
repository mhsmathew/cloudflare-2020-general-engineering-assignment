const socials = [
    { "name": "Instagram", "url": "https://instagram.com/mhsmathew", "svgUrl": "https://simpleicons.org/icons/instagram.svg" },
    { "name": "GitHub", "url": "https://github.com/mhsmathew", "svgUrl": "https://simpleicons.org/icons/github.svg" },
    { "name": "LinkedIn", "url": "https://www.linkedin.com/in/mathew-steininger", "svgUrl": "https://simpleicons.org/icons/linkedin.svg" }
]

const links = [
    { "name": "Twitter", "url": "https://www.twitter.com/" },
    { "name": "Amazon", "url": "https://www.amazon.com/" },
    { "name": "Youtube", "url": "https://www.youtube.com/" }
]

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    if (request.url.substring(request.url.lastIndexOf('/')) == "/links") {
        return new Response(JSON.stringify(links), {
            headers: { 'content-type': 'application/json' },
        });
    }
    return getStaticPage();
}

class LinkTransformer {
    constructor(links) {
        this.links = links;
    }

    async element(element) {
        if (!element)
            return;
        let text = '\n';
        this.links.forEach((link) => {
            text += `<a href="${link.url}">${link.name}</a>\n`;
        })
        element.setInnerContent(text, { html: true });

    }
}

class ProfileTransformer {
    async element(element) {
        if (!element)
            return;
        if (element.tagName === "div")
            element.removeAttribute("style");
        if (element.tagName === "img")
            element.setAttribute("src", "https://avatars0.githubusercontent.com/u/32316796?s=400&u=1a2fb69363d2a4912574ee3d4774677dbfe9f6bc&v=4");
        if (element.tagName === "h1")
            element.setInnerContent("Mathew Steininger");

    }
}

class SocialTransformer {
    constructor(links) {
        this.links = links;
    }

    async element(element) {
        if (!element)
            return;
        element.removeAttribute("style");
        let text = '';
        this.links.forEach((link) => {
            text += `<a href="${link.url}"><img style="filter:invert(100%);" src="${link.svgUrl}" alt="${link.name}"></a>`;
        })
        element.setInnerContent(text, { html: true });

    }
}

class PageTransformer {
    async element(element) {
        if (!element)
            return;
        if (element.tagName === "title")
            element.setInnerContent("Mat's Page");
        if (element.tagName === "body")
            element.setAttribute("class", "bg-purple-800");

    }
}

const profileNameTransformer = new HTMLRewriter().on('h1#name', new ProfileTransformer());
const socialTransformer = new HTMLRewriter().on('div#social', new SocialTransformer(socials));
const pageTransformer = new HTMLRewriter().on('body', new PageTransformer());
const titleTransformer = new HTMLRewriter().on('title', new PageTransformer());
const linkTransformer = new HTMLRewriter().on('div#links', new LinkTransformer(links));
const profileTransformer = new HTMLRewriter().on('div#profile', new ProfileTransformer());
const profileImageTransformer = new HTMLRewriter().on('img#avatar', new ProfileTransformer());

async function getStaticPage() {
    let staticPage = await fetch('https://static-links-page.signalnerve.workers.dev')
        .then((response) => {
            if (response.status == 200) {
                return response;
            } else new Response('Errored out', { status: 500 });
        })
    return socialTransformer.transform(pageTransformer.transform(titleTransformer.transform(linkTransformer.transform(profileTransformer.transform(profileImageTransformer.transform(profileNameTransformer.transform(staticPage)))))));
}