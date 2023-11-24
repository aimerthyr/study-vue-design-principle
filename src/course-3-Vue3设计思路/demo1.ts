import { mountElement } from './util';

/** 常规虚拟 dom 渲染（即 tag 为普通 HTML 标签）*/
const vnode = {
	tag: 'div',
	props: {
		onClick: () => {
			console.log('我被点击了');
		}
	},
	children: '我是 div'
};
mountElement(vnode, document.getElementById('app'));
export default void 0;

