import { mountElement } from './util';

function renderer(node: any, root: HTMLElement) {
	if (typeof node.tag === 'string') {
		mountElement(node, root);
	} else if (typeof node.tag === 'object') {
		const vnode = node.tag.render();
		renderer(vnode, root);
	}
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