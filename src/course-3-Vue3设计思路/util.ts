export function mountElement(node: any, root: HTMLElement) {
	const ele = document.createElement(node.tag) as HTMLElement;
	for (const key in node.props) {
		// 判断是否是以 on 开头的键名
		if (/^on/.test(key)) {
			// 设置监听函数
			ele.addEventListener(key.slice(2).toLowerCase(), node.props[key]);
		}
	}
	if (typeof node.children === 'string') {
		ele.appendChild(document.createTextNode(node.children));
	} else if (Array.isArray(node.children)) {
		(ele.children as any).forEach(child => mountElement(child, root));
	}
	root.appendChild(ele);
}