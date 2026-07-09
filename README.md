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
