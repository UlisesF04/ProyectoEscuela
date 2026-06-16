fetch('/api/v1/subjects/my/courses', {credentials:'include'}).then(r=>r.json()).then(d=>{console.log('1. RAW API:', JSON.stringify(d).slice(0,200));return d}).then(d=>{console.log('2. PRIMER CURSO:', d.data[0].name, 'ALUMNOS:', d.data[0].students.length)})
Promise {<pending>}
VM144:1 1. RAW API: {"status":"success","data":[{"id":1,"name":"1° A","year":2026,"division":"A","subjects":[{"id":1,"name":"Matemática"}],"students":[{"id":1,"first_name":"Thiago","last_name":"García","dni":"45123456"},
VM144:1 2. PRIMER CURSO: 1° A ALUMNOS: 11

const root = document.getElementById('root');
const fiberRoot = root._reactRootContainer || Object.keys(root).find(k=>k.startsWith('__reactFiber$'));
console.log('Fiber key:', fiberRoot);
VM148:3 Fiber key: undefined
undefined