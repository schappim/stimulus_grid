export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v == null) continue;
    if (k === 'class') node.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) node.setAttribute(k, '');
    else node.setAttribute(k, String(v));
  }
  for (const c of [].concat(children)) {
    if (c == null || c === false) continue;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

export function setAttrs(node, attrs) {
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) node.removeAttribute(k);
    else if (v === true) node.setAttribute(k, '');
    else node.setAttribute(k, String(v));
  }
}

export function cloneTemplate(id) {
  const tpl = document.getElementById(id);
  if (!tpl || tpl.tagName !== 'TEMPLATE') return null;
  return tpl.content.firstElementChild.cloneNode(true);
}

export function emit(target, name, detail) {
  target.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }));
}

export function findParentController(startEl, identifier, application) {
  let cur = startEl.parentElement;
  while (cur) {
    const controllers = (cur.getAttribute('data-controller') || '').split(/\s+/);
    if (controllers.includes(identifier)) {
      const c = application.getControllerForElementAndIdentifier(cur, identifier);
      if (c) return c;
    }
    cur = cur.parentElement;
  }
  return null;
}
