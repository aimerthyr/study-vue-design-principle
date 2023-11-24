/** js 对象转 DOM 元素（简易版） */
function Render(obj: any, root: HTMLElement) {
	const ele = document.createElement(obj.tag) as HTMLElement;
	if (typeof obj.children === 'string') {
		ele.appendChild(document.createTextNode(obj.children));
	} else if (obj.children) {
		obj.children.forEach((child: any) => Render(child, ele));
	}
	root.appendChild(ele);
}

const vnode = {
	tag: 'div',
	children: [
		{ tag: 'h1', children: 'hello world' }
	]
};

Render(vnode, document.getElementById('app')!);

export default void 0;
