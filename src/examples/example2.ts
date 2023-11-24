/** js 对象转 DOM 元素（较为完善版） */
function renderer(node: any, root: HTMLElement) {
	if (typeof node.tag === 'string') {
		mountElement(node, root);
	} else if (typeof node.tag === 'object') {
		const vnode = node.tag.render();
		renderer(vnode, root);
	} 
}

/** 挂载普通 DOM 元素 */
function mountElement(node: any, root: HTMLElement) {
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

const MyComponent = {
	render() {
		return {
			tag: 'div',
			props: {
				onClick: () => alert('hello')
			},
			children: 'click me'
		};
	}
};

const vnode = {
	tag: MyComponent
};
renderer(vnode, document.getElementById('app'));

export default void 0;
