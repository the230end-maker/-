# منصة كتابة الروايات متعددة العملاء

منصة React + Vite + TypeScript بواجهة عربية RTL، تستخدم Express API كطبقة خلفية وMongoDB كقاعدة البيانات الأساسية لحفظ الرواية والكتاب المرجعي والإعدادات وسجل العملاء والنسخ الاحتياطية.

## أين أضع رابط MongoDB؟

ضع رابط MongoDB في ملف `.env` في جذر المشروع بنفس اسم المفتاح التالي:

```bash
MONGODB_URI=mongodb://localhost:27017
```

أو إذا كنت تستخدم MongoDB Atlas:

```bash
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/novel_writer?retryWrites=true&w=majority
```

المفتاح الصحيح هو **`MONGODB_URI`**. يقرأه الخادم من `process.env.MONGODB_URI`، وإذا لم تضعه سيحاول الاتصال افتراضياً بـ:

```bash
mongodb://localhost:27017
```

> ملاحظة مهمة: لا تضع رابط MongoDB الحقيقي داخل كود الواجهة أو داخل Git. استخدم `.env` فقط.

## هل أحتاج إلى `VITE_MONGODB_URI`؟

غالباً لا. التطبيق يتصل بقاعدة البيانات عبر backend API على `/api`، وليس مباشرة من المتصفح. يوجد `VITE_MONGODB_URI` فقط كقيمة توافقية في `src/lib/mongodb.ts`، لكن التشغيل الطبيعي يحتاج إلى `MONGODB_URI` في الخادم.

## ملف `.env` المقترح

انسخ الملف `.env.example` إلى `.env` ثم عدّل القيم:

```bash
cp .env.example .env
```

مثال محلي:

```bash
MONGODB_URI=mongodb://localhost:27017
PORT=8787
```

مثال Atlas:

```bash
MONGODB_URI=mongodb+srv://myUser:myPassword@cluster0.xxxxx.mongodb.net/novel_writer?retryWrites=true&w=majority
PORT=8787
```

## ما الأشياء التي يجب أن أضعها أنا؟

1. **رابط MongoDB** في `.env` تحت المفتاح `MONGODB_URI`.
2. **MongoDB يعمل فعلياً**:
   - محلياً: شغّل خدمة MongoDB على جهازك.
   - Atlas: أنشئ Cluster، ثم Database User، واسمح لعنوان IP الخاص بك من Network Access.
3. **توكنات DeepSeek** من صفحة الإعدادات داخل التطبيق:
   - افتح `الإعدادات`.
   - أضف التوكنات الإضافية إن أردت.
   - اختر التوكن النشط.
   - عيّن نموذج كل عميل: `default` أو `expert`.
4. **مزود POW** من صفحة الإعدادات:
   - `Railway` هو الافتراضي.
   - `Ngrok` بديل إذا كان خادم Railway غير متاح.
5. **بيانات الرواية الأولى** من صفحة البداية:
   - اسم الرواية.
   - النوع الأدبي.
   - الفكرة الأولية.

## التشغيل

بعد تثبيت الحزم:

```bash
npm install
npm run dev
```

سيعمل الخادم عادة على:

```text
http://localhost:8787
```

وستعمل واجهة Vite على المنفذ الذي يعرضه Vite في الطرفية، مع proxy إلى `/api`.

## قاعدة البيانات المستخدمة

اسم قاعدة البيانات هو:

```text
novel_writer
```

والمجموعات التي يستخدمها التطبيق هي:

```text
novel
chapters
characters
world
glossary
timeline
relationships
novel_state
agent_conversations
settings
backups
```

## النسخ الاحتياطي والاستعادة

من الشريط العلوي تستطيع:

- تصدير نسخة احتياطية JSON تشمل كل المجموعات.
- استعادة نسخة JSON بعد عرض ملخص وطلب تأكيد، مع مسح البيانات الحالية قبل الاستيراد.

## النشر على Vercel

هذا المشروع أصبح متوافقاً مع Vercel عبر مجلد `api/` الذي يحتوي Serverless Function واحدة تلتقط كل مسارات `/api/*`، لذلك لن تحتاج إلى تشغيل Express server منفصل على Vercel.

### 1. جهّز MongoDB Atlas

Vercel لا يوفر MongoDB محلياً، لذلك استخدم MongoDB Atlas:

1. أنشئ Cluster على MongoDB Atlas.
2. أنشئ Database User واحفظ اسم المستخدم وكلمة المرور.
3. من Network Access أضف السماح لاتصالات Vercel. للتجربة السريعة يمكن استخدام `0.0.0.0/0`، وللإنتاج يفضّل تقييد الوصول بقدر الإمكان.
4. انسخ Connection String بصيغة:

```bash
mongodb+srv://<username>:<password>@<cluster-url>/novel_writer?retryWrites=true&w=majority
```

### 2. ارفع المشروع إلى GitHub

```bash
git add .
git commit -m "Prepare Vercel deployment"
git push origin main
```

### 3. أنشئ مشروع Vercel

1. افتح Vercel Dashboard.
2. اضغط **Add New Project**.
3. اختر مستودع GitHub الخاص بالمشروع.
4. Vercel سيكتشف أنه Vite تلقائياً.
5. تأكد من الإعدادات:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### 4. أضف Environment Variables في Vercel

من صفحة المشروع في Vercel:

`Settings` → `Environment Variables`

أضف المتغيرات التالية:

```bash
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/novel_writer?retryWrites=true&w=majority
MONGODB_DB=novel_writer
```

المتغير الإلزامي هو `MONGODB_URI`. المتغير `MONGODB_DB` اختياري، وإذا لم تضعه سيستخدم التطبيق `novel_writer` تلقائياً.

### 5. Deploy

اضغط **Deploy**. بعد اكتمال البناء ستعمل:

- الواجهة من رابط Vercel الرئيسي.
- API من نفس الدومين تحت `/api`، مثل:
  - `/api/state`
  - `/api/backup/export`
  - `/api/backup/import`

### 6. بعد النشر

1. افتح رابط Vercel.
2. أنشئ الرواية من Dashboard.
3. افتح صفحة الإعدادات.
4. أضف توكنات DeepSeek إن أردت استخدام توكناتك الخاصة.
5. اختر مزود POW: Railway أو Ngrok.
6. جرّب تصدير نسخة احتياطية للتأكد من اتصال MongoDB.

### ملاحظات مهمة على Vercel

- لا تضع `MONGODB_URI` داخل الكود أو داخل GitHub، ضعه فقط في Vercel Environment Variables.
- إذا غيّرت Environment Variables بعد النشر، أعد عمل Redeploy.
- لا تستخدم MongoDB محلياً على Vercel؛ استخدم Atlas أو مزود MongoDB سحابي.
- Serverless Functions لها زمن تنفيذ محدود؛ لذلك عمليات DeepSeek الطويلة جداً قد تحتاج لاحقاً إلى Queue أو Backend منفصل إذا توسع المشروع.

## حل مشكلة فشل Vite بسبب مكتبة `mongodb`

مكتبة `mongodb` مخصصة لبيئة Node.js فقط، لذلك لا يجوز استيرادها داخل أي ملف في `src/` لأن هذه الملفات تدخل في حزمة المتصفح عند تشغيل `npm run build`.

البنية الصحيحة في هذا المشروع هي:

- ملفات الواجهة داخل `src/` تستخدم `fetch('/api/...')` فقط.
- اتصال MongoDB الحقيقي موجود في:
  - `api/[...path].ts` عند النشر على Vercel.
  - `server/index.ts` عند التشغيل المحلي بخادم Express.

لذلك لا تفصل الخادم عن الواجهة الآن إذا كان هدفك Vercel؛ الصيغة الحالية مناسبة كـ Monorepo:

```text
src/          واجهة React فقط
api/          Vercel Serverless Functions وفيها MongoDB
server/       Express للتشغيل المحلي فقط
```

أما رفع المشروع كاملاً على Railway فهو ممكن أيضاً، لكن عندها ستستخدم Express server وتحتاج إعداد تشغيل مختلف. إذا كان هدفك أسهل نشر لواجهة + API صغيرة، فالأفضل حالياً هو Vercel + MongoDB Atlas.

## حل خطأ Vercel: Cannot find module 'tailwindcss'

إذا ظهر هذا الخطأ أثناء `npm run build` على Vercel فهذا يعني أن Tailwind/PostCSS غير موجودين ضمن dependencies التي يثبتها Vercel. تم تثبيت الحزم المطلوبة داخل `dependencies` وليس `devDependencies` لضمان أن Vercel يثبتها دائماً:

```json
"tailwindcss": "3.4.17",
"postcss": "8.4.49",
"autoprefixer": "10.4.20"
```

تم تثبيت Tailwind على الإصدار `3.4.17` تحديداً لأن `postcss.config.js` الحالي يستخدم صيغة Tailwind v3 المستقرة:

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

بعد رفع هذا التعديل إلى GitHub، أعد تشغيل Deploy من Vercel. إذا كان Vercel يستخدم cache قديم، اختر Redeploy مع تعطيل Build Cache.

## حل خطأ Vercel: Cannot read properties of undefined (reading 'readFile')

إذا نجح `vite build` ثم فشل Vercel بعدها برسالة مثل:

```text
Using TypeScript 7.0.2 (local user-provided)
Error: Cannot read properties of undefined (reading 'readFile')
```

فالسبب أن `typescript` كان مضبوطاً على `latest`، وVercel قام بتثبيت نسخة حديثة جداً/غير مستقرة بالنسبة لأدوات البناء. تم تثبيت TypeScript على إصدار مستقر:

```json
"typescript": "5.6.3"
```

بعد هذا التعديل أعد النشر من Vercel، ويفضل اختيار Redeploy بدون Build Cache حتى لا يستخدم نسخة TypeScript القديمة.
