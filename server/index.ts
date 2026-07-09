import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'novel_writer';
const collections = ['novel','chapters','characters','world','glossary','timeline','relationships','novel_state','agent_conversations','settings','backups'];
let connected=false;
async function db(){ if(!connected){ await client.connect(); connected=true;} return client.db(dbName); }
const app=express(); app.use(cors()); app.use(express.json({limit:'25mb'}));
app.get('/api/state', async (_req,res)=>{ const d=await db(); const out:any={}; for(const c of collections){ out[c]=['novel','world','novel_state','settings'].includes(c)? await d.collection(c).findOne({}) : await d.collection(c).find({}).toArray(); } res.json(out); });
app.post('/api/novel', async (req,res)=>{ const d=await db(); await d.collection('novel').deleteMany({}); await d.collection('novel').insertOne({...req.body,id:req.body.id||crypto.randomUUID(),createdAt:new Date().toISOString(),lastModified:new Date().toISOString()}); res.json({ok:true}); });
app.post('/api/:collection', async (req,res)=>{ const {collection}=req.params; if(!collections.includes(collection)) return res.status(404).json({error:'unknown collection'}); const d=await db(); const doc={...req.body,id:req.body.id||crypto.randomUUID(),updatedAt:new Date().toISOString()}; await d.collection(collection).updateOne({id:doc.id},{$set:doc},{upsert:true}); res.json(doc); });
app.delete('/api/:collection/:id', async (req,res)=>{ const d=await db(); await d.collection(req.params.collection).deleteOne({id:req.params.id}); res.json({ok:true}); });
app.get('/api/backup/export', async (_req,res)=>{ const d=await db(); const backup:any={}; for(const c of collections.filter(x=>x!=='backups')) backup[c]=['novel','world','novel_state','settings'].includes(c)? await d.collection(c).findOne({}) : await d.collection(c).find({}).toArray(); backup.exportedAt=new Date().toISOString(); await d.collection('backups').insertOne({createdAt:backup.exportedAt,novel:backup.novel?.title||'بدون اسم'}); res.json(backup); });
app.post('/api/backup/import', async (req,res)=>{ const b=req.body; if(!b.novel||!Array.isArray(b.chapters)) return res.status(400).json({error:'ملف النسخ الاحتياطي غير صالح'}); const d=await db(); for(const c of collections.filter(x=>x!=='backups')) await d.collection(c).deleteMany({}); for(const c of collections.filter(x=>x!=='backups')){ const v=b[c]; if(Array.isArray(v)&&v.length) await d.collection(c).insertMany(v); else if(v) await d.collection(c).insertOne(v); } res.json({ok:true,backup:b}); });
app.listen(Number(process.env.PORT||8787),()=>console.log('API http://localhost:8787'));
