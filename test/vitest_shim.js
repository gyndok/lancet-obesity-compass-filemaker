/* minimal vitest shim for running the original golden suites in node */
'use strict';
let total=0, failed=0; const ctx=[];
global.describe=(name,fn)=>{ctx.push(name);fn();ctx.pop();};
const _it=(name,fn)=>{total++;try{fn();}catch(e){failed++;console.error('FAIL:',ctx.join(' > '),'>',name,'\n  ',e.message);}};
_it.each=(cases)=>(name,fn)=>{cases.forEach((c)=>{const args=Array.isArray(c)?c:[c];_it(name+' '+JSON.stringify(args[0]),()=>fn(...args));});};
global.it=_it;
function fmt(x){try{return JSON.stringify(x);}catch(_){return String(x);}}
class Exp{
 constructor(v,neg){this.v=v;this.neg=!!neg;}
 get not(){return new Exp(this.v,!this.neg);}
 _chk(ok,msg){if(this.neg?ok:!ok)throw new Error((this.neg?'not ':'')+msg);}
 toBe(e){this._chk(Object.is(this.v,e),`expected ${fmt(this.v)} toBe ${fmt(e)}`);}
 toEqual(e){this._chk(fmt(this.v)===fmt(e),`expected ${fmt(this.v)} toEqual ${fmt(e)}`);}
 toBeNull(){this._chk(this.v===null,`expected ${fmt(this.v)} toBeNull`);}
 toBeUndefined(){this._chk(this.v===undefined,`expected ${fmt(this.v)} toBeUndefined`);}
 toBeTruthy(){this._chk(!!this.v,`expected ${fmt(this.v)} toBeTruthy`);}
 toBeFalsy(){this._chk(!this.v,`expected ${fmt(this.v)} toBeFalsy`);}
 toContain(e){const ok=(typeof this.v==='string')?this.v.includes(e):Array.isArray(this.v)&&this.v.some(x=>fmt(x)===fmt(e)||x===e);this._chk(ok,`expected ${fmt(this.v)} toContain ${fmt(e)}`);}
 toHaveLength(n){this._chk(this.v!=null&&this.v.length===n,`expected length ${this.v&&this.v.length} toBe ${n}`);}
 toBeCloseTo(e,p=2){const f=Math.pow(10,p);this._chk(Math.abs(this.v-e)<1/f/2*10,`expected ${this.v} toBeCloseTo ${e}`);}
 toBeGreaterThan(e){this._chk(this.v>e,`expected ${this.v} > ${e}`);}
 toBeGreaterThanOrEqual(e){this._chk(this.v>=e,`expected ${this.v} >= ${e}`);}
 toBeLessThan(e){this._chk(this.v<e,`expected ${this.v} < ${e}`);}
 toBeLessThanOrEqual(e){this._chk(this.v<=e,`expected ${this.v} <= ${e}`);}
 toMatch(re){this._chk((typeof re==='string')?this.v.includes(re):re.test(this.v),`expected ${fmt(this.v)} toMatch ${re}`);}
}
global.expect=v=>new Exp(v);
global.__report=()=>{console.log(`${total-failed}/${total} tests passed`);if(failed)process.exit(1);};
