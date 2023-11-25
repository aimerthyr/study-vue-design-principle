
// 原始对象
const data = { num1: 1, num2: 2 };
const bucket = new WeakMap();

// 全局的副作用函数
let activeEffect: { (): any; deps: Set<any>[]; };
const globalEffectStack: Array<{ (): any; deps: Set<any>[]; }> = [];
// 代理对象
const obj = new Proxy(data, {
	get(target, key) {
		if(!activeEffect) return target[key];
		track(target, key);
		return target[key];
	},
	set(target, key, value) {
		target[key] = value;
		trigger(target, key);
		return true;
	}
});

/** 依赖收集 */
function track(target: any, key: any) {
	if(!activeEffect) return;
	// 先找到当前对象的依赖Map
	let depsMap = bucket.get(target);
	if (!depsMap) {
		bucket.set(target, (depsMap = new Map()));
	}
	// 找到这个对象 key 的依赖
	let deps = depsMap.get(key);
	if (!deps) {
		depsMap.set(key, deps = new Set());
	}
	// 将当前的副作用函数添加到依赖中
	deps.add(activeEffect);
	// 在把当前这个 key 存入到副作用函数的依赖中（这里是为了保存，有哪些 key 依赖了这个副作用函数）
	activeEffect.deps.push(deps);
}

function trigger(target: any, key: any) {
	// 找到当前对象的依赖Map
	const depsMap = bucket.get(target);
	if (!depsMap) return;
	// 找到这个 key 的副作用函数列表
	const effects = depsMap.get(key);
	// 依次触发与他相关联的副作用函数
	effects && new Set(effects).forEach((effect: any) => {
		// 如果 trigger 触发的副作用函数刚好等于当前正在执行的副作用函数，则不触发执行（防止出现无线递归）
		if (activeEffect === effect) return;
		if (effect.options?.scheduler) {
			effect.options.scheduler(effect);
		} else {
			effect();
		}
	});
}

// 注册副作用函数
function effect(fn: any, options?: any) {
	/**
   * 注册完之后，其实真正的副作用函数变成了 effectFn
   * 所以当 trigger 触发时，会执行这里的 effectFn 然后接触所有绑定了 effectFn 的依赖
   */
	const effectFn = () => {
		cleanup(effectFn);
		// 当调用 effect 注册副作用函数时，将副作用函数复制给 activeEffect
		activeEffect = effectFn;
		// 在调用副作用函数之前将当前副作用函数压栈
		globalEffectStack.push(effectFn);
		const res = fn();
		// 在当前副作用函数执行完毕后，将当前副作用函数弹出栈，并还原 activeEffect 为之前的值
		globalEffectStack.pop();
		activeEffect = globalEffectStack[globalEffectStack.length - 1];
		return res;
	};
	effectFn.options = options;
	effectFn.deps = [];
	if (!options?.lazy) {
		effectFn();
	}
	return effectFn;
}


/** 清空当前副作用函数的依赖 */
function cleanup(effectFn) {
	// 找到所有关联了当前副作用函数的 key
	for (let i = 0; i < effectFn.deps.length; i++) {
		const deps = effectFn.deps[i];
		// 然后在 key 的依赖中删除当前副作用函数
		deps.delete(effectFn);
	}
	effectFn.deps.length = 0;
}

/**
 * 遍历一个对象的所有属性
 * 需要在副作用函数中去递归遍历这个对象的属性，这样才能将所有的属性变化都收集起来
 */
function traverse(value: any, seen = new Set()) {
	if (typeof value !== 'object' || value === null || seen.has(value)) return;
	seen.add(value);
	for (const key in value) {
		traverse(value[key], seen);
	}
	return value;
}



function watch(source, watchCb: (newValue: any, oldValue: any, onInvalidate: any) => void, options: any = {}) {
	let newValue, oldValue;
	let getter;
	if (typeof source === 'function') {
		getter = source;
	} else {
		getter = () => traverse(source);
	}
  
	let cleanup;

	function onInvalidate(fn) {
		cleanup = fn;
	}

	const job = () => {
		newValue = effectFn();
		if (cleanup) {
			cleanup();
		}
		watchCb(newValue, oldValue, onInvalidate);
		oldValue = newValue;
	};
	const effectFn = effect(() => getter(), {
		lazy: true,
		scheduler() {
			if (options.flush === 'post') {
				Promise.resolve().then(job);
			} else {
				job();
			}
		}
	});

	if (options.immediate) {
		job();
	} else {
		oldValue = effectFn();
	}
}

let count = 0;
function fetch() {
	count++;
	const res = count === 1 ? 'A' : 'B';
	return new Promise(resolve => {
		setTimeout(() => {
			resolve(res);
		}, count === 1 ? 1000 : 100);
	});
}

let finallyData;

watch(() => obj.num1, async (newVal, oldVal, onInvalidate) => {
	let valid = true;
	onInvalidate(() => {
		valid = false;
	});
	const res = await fetch();

	if (!valid) return;

	finallyData = res;
	console.log(finallyData);
});

obj.num1++;
setTimeout(() => {
	obj.num1++;
}, 200);
