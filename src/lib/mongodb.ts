import { MongoClient } from 'mongodb';
const uri = import.meta.env?.VITE_MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'novel_writer';
export async function connectDB(){ await client.connect(); return client.db(dbName); }
export async function api<T>(path:string, init?:RequestInit):Promise<T>{ const r=await fetch(`/api${path}`,{headers:{'Content-Type':'application/json',...(init?.headers||{})},...init}); if(!r.ok) throw new Error(await r.text()); return r.json(); }
