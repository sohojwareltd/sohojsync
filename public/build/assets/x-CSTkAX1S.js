import{r as s}from"./app-DZpL_gQd.js";function l(e){var t,r,o="";if(typeof e=="string"||typeof e=="number")o+=e;else if(typeof e=="object")if(Array.isArray(e)){var n=e.length;for(t=0;t<n;t++)e[t]&&(r=l(e[t]))&&(o&&(o+=" "),o+=r)}else for(r in e)e[r]&&(o&&(o+=" "),o+=r);return o}function D(){for(var e,t,r=0,o="",n=arguments.length;r<n;r++)(e=arguments[r])&&(t=l(e))&&(o&&(o+=" "),o+=t);return o}var p={exports:{}},d={};/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var u=s;function S(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var g=typeof Object.is=="function"?Object.is:S,E=u.useState,C=u.useEffect,x=u.useLayoutEffect,b=u.useDebugValue;function k(e,t){var r=t(),o=E({inst:{value:r,getSnapshot:t}}),n=o[0].inst,a=o[1];return x(function(){n.value=r,n.getSnapshot=t,c(n)&&a({inst:n})},[e,r,t]),C(function(){return c(n)&&a({inst:n}),e(function(){c(n)&&a({inst:n})})},[e]),b(r),r}function c(e){var t=e.getSnapshot;e=e.value;try{var r=t();return!g(e,r)}catch{return!0}}function A(e,t){return t()}var L=typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"?A:k;d.useSyncExternalStore=u.useSyncExternalStore!==void 0?u.useSyncExternalStore:L;p.exports=d;var N=p.exports;/**
 * @license lucide-react v0.560.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),j=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,r,o)=>o?o.toUpperCase():r.toLowerCase()),f=e=>{const t=j(e);return t.charAt(0).toUpperCase()+t.slice(1)},m=(...e)=>e.filter((t,r,o)=>!!t&&t.trim()!==""&&o.indexOf(t)===r).join(" ").trim(),_=e=>{for(const t in e)if(t.startsWith("aria-")||t==="role"||t==="title")return!0};/**
 * @license lucide-react v0.560.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var I={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.560.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const O=s.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:r=2,absoluteStrokeWidth:o,className:n="",children:a,iconNode:h,...i},v)=>s.createElement("svg",{ref:v,...I,width:t,height:t,stroke:e,strokeWidth:o?Number(r)*24/Number(t):r,className:m("lucide",n),...!a&&!_(i)&&{"aria-hidden":"true"},...i},[...h.map(([y,w])=>s.createElement(y,w)),...Array.isArray(a)?a:[a]]));/**
 * @license lucide-react v0.560.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=(e,t)=>{const r=s.forwardRef(({className:o,...n},a)=>s.createElement(O,{ref:a,iconNode:t,className:m(`lucide-${$(f(e))}`,`lucide-${e}`,o),...n}));return r.displayName=f(e),r};/**
 * @license lucide-react v0.560.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],P=R("x",U);export{P as X,R as a,D as c,N as s};
