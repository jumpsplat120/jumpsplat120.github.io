//Stupid workaround for the fact that custom elements fire
//connectedCallback at the opening tag instead of the closing tag,
//which means we can't access the children of the element.
class HTMLBaseElement extends HTMLElement {
    connectedCallback() {
        setTimeout(_ => this.parsedCallback(), 0);
    }
}

class NpcElement extends HTMLBaseElement {
    constructor() {
        super();

        this.template_content = document.getElementById("npc-template").content;
    }

    parsedCallback() {
        const node = this.template_content.cloneNode(true);

        node.querySelector(".npc").innerHTML = this.innerHTML;
        node.querySelector(".timestamp").textContent = this.dataset.timestamp;

        this.replaceChildren(node);
    }
}

class EmoteElement extends HTMLBaseElement {
    constructor() {
        super();

        this.template_content = document.getElementById("emote-template").content;
    }

    parsedCallback() {
        const node = this.template_content.cloneNode(true);

        node.querySelector(".emote").innerHTML = this.innerHTML;
        node.querySelector(".timestamp").textContent = this.dataset.timestamp;

        this.replaceChildren(node);
    }
}

class MessageElement extends HTMLBaseElement {
    constructor() {
        super();

        this.template_content = document.getElementById("message-template").content;
    }

    parsedCallback() {
        const node = this.template_content.cloneNode(true);

        node.querySelector(".user").textContent = this.dataset.user;
        node.querySelector(".message").innerHTML = this.innerHTML;
        node.querySelector(".timestamp").textContent = this.dataset.timestamp;

        if (this.dataset.userColor) {
            node.querySelector(".user").style = "color: " + this.dataset.userColor + ";";
        }

        if (this.hasAttribute("data-ooc")) {
            node.querySelector(".message").classList.replace("message", "ooc");
        }

        this.replaceChildren(node);
    }
}

customElements.define("wow-npc", NpcElement);
customElements.define("wow-emote", EmoteElement);
customElements.define("wow-message", MessageElement);