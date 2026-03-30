import fs from 'fs';

const path = 'public/res/C001/skeleton.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

if (Array.isArray(data.ik)) {
    const ikMap = {};
    data.ik.forEach(ik => {
        const name = ik.name;
        delete ik.name;
        ikMap[name] = ik;
    });
    data.ik = ikMap;
    console.log('Converted ik array to map');
}

// Also convert transform constraints if they are arrays
if (Array.isArray(data.transform)) {
    const transformMap = {};
    data.transform.forEach(t => {
        const name = t.name;
        delete t.name;
        transformMap[name] = t;
    });
    data.transform = transformMap;
    console.log('Converted transform array to map');
}

// Also convert path constraints if they are arrays
if (Array.isArray(data.path)) {
    const pathMap = {};
    data.path.forEach(p => {
        const name = p.name;
        delete p.name;
        pathMap[name] = p;
    });
    data.path = pathMap;
    console.log('Converted path array to map');
}

// Also convert events if they are arrays
if (Array.isArray(data.events)) {
    const eventMap = {};
    data.events.forEach(e => {
        const name = e.name;
        delete e.name;
        eventMap[name] = e;
    });
    data.events = eventMap;
    console.log('Converted events array to map');
}

fs.writeFileSync(path, JSON.stringify(data));
