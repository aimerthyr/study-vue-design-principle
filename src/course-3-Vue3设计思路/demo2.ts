import { mountElement } from './util';


/** 函数式组件渲染 */
function renderer(node: any, root: HTMLElement) {
	if (typeof node.tag === 'string') {
		mountElement(node, root);
	} else if (typeof node.tag === 'function') {
		renderer(node.tag(), root);
	}
}



const MyComponent = function () {
	return {
		tag: 'div',
		props: {
			onClick: () => alert('hello')
		},
		children: 'click me'
	};
};

/** 组件式渲染 */
const vnode = {
	tag: MyComponent
};

renderer(vnode, document.getElementById('app'));

export default void 0;