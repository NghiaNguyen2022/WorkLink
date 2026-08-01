import {createServer} from 'node:http';import {jobs,workers} from './mock.js';
const port=Number(process.env.API_PORT??4000);
const server=createServer((req,res)=>{res.setHeader('content-type','application/json; charset=utf-8');res.setHeader('access-control-allow-origin','*');if(req.url==='/health')return res.end(JSON.stringify({status:'ok',service:'worklink-api',timestamp:new Date().toISOString()}));if(req.url==='/api/jobs')return res.end(JSON.stringify(jobs));if(req.url==='/api/workers')return res.end(JSON.stringify(workers));res.statusCode=404;res.end(JSON.stringify({error:'NOT_FOUND'}));});
server.listen(port,()=>console.log(`WorkLink API listening on http://localhost:${port}`));
