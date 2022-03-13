class StatusReporter {
  graphics = {
    loading: `<polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>`,
    check: `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>`,
    error: `<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>`,
  };
  statusicon = null;
  statustext = null;
  statuscontainer = null;
  constructor(el) {
    this.statusicon = document.createElement("div");
    this.statustext = document.createElement("p");
    this.statuscontainer = document.createElement("div");

    this.statustext.innerText = "Ready...";

    this.statuscontainer.classList.add("status-container");

    this.statuscontainer.appendChild(this.statusicon);
    this.statuscontainer.appendChild(this.statustext);

    el.appendChild(this.statuscontainer);
  }

  setStatus(status, text) {
    this.statuscontainer.setAttribute("data-status", status);
    this.statusicon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${this.graphics[status]}</svg>`;
    this.statustext.innerText = text;
  }
}

export default StatusReporter;
