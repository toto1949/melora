export type LegalDocumentKey = "terms" | "privacy" | "refunds";

type LegalDocument = {
  title: string;
  updated: string;
  intro: string;
  sections: Array<{ title: string; body: string }>;
};

type LegalLocale = "en" | "fr" | "es" | "ar";

export const LEGAL_CONTENT: Record<LegalLocale, Record<LegalDocumentKey, LegalDocument>> = {
  en: {
    terms: {
      title: "Terms of Service", updated: "Last updated August 12, 2026",
      intro: "These terms govern your use of Memories to Melody (\"we\", \"us\") at memoriestomelody.com. By placing an order or creating an account, you agree to them. If you do not agree, please do not use the service.",
      sections: [
        { title: "1. What we provide", body: "Memories to Melody creates personalized songs from the stories, names, and preferences you provide. Each order includes the items shown for its package at purchase. Delivery targets and revision credits are also described on the pricing page." },
        { title: "2. Your content and our license to use it", body: "You confirm you have the right to share every story, name, photo, and other item you submit and that it is lawful. You keep ownership. You give us a limited license to process it only to fulfill and support your order. We do not use it to train AI models unless you explicitly opt in." },
        { title: "3. Your license to the finished song", body: "Every package includes a lifetime personal-use license. You may listen, download, share the private link, play the song at private events, and post it on personal social accounts. Advertising, monetized content, resale, broadcast, or other commercial use requires a separate license." },
        { title: "4. Delivery and revisions", body: "Delivery targets begin when payment and all required story details are complete. They are good-faith estimates unless a paid rush option expressly states otherwise. Included revision credits cover reasonable changes within the original story and occasion." },
        { title: "5. Payment", body: "Prices and any estimated taxes are shown at checkout and charged when you order. Stripe processes payments; we do not store card details. Discount codes cannot be applied retroactively." },
        { title: "6. Acceptable use", body: "You may not create unlawful, hateful, harassing, defamatory, non-consensual impersonation, or sexual content involving minors. You may not disrupt, scrape, or resell the service without permission. We may decline or refund a violating order." },
        { title: "7. Accounts", body: "You are responsible for securing your credentials and account activity. You may request account deletion from your dashboard or support, subject to the retention described in our Privacy Policy." },
        { title: "8. Disclaimers and liability", body: "The service is provided as is. To the maximum extent allowed by law, our total liability for an order is limited to what you paid for it, and we are not liable for indirect or consequential loss. This does not limit liability that law does not allow us to limit." },
        { title: "9. Changes to these terms", body: "We may update these terms as the service evolves. Material changes appear here with a new update date. An order remains governed by the terms in effect when it was placed." },
        { title: "10. Contact", body: "Questions about these terms? Email {email}." },
      ],
    },
    privacy: {
      title: "Privacy Policy", updated: "Last updated August 12, 2026",
      intro: "Your songs are built from personal stories, so privacy is core to how Memories to Melody works. This policy explains what we collect, why, and the choices you have.",
      sections: [
        { title: "1. What we collect", body: "We collect account details such as email and name; the order, recipient, story, and music preferences you submit; optional private uploads; payment totals and status from Stripe, but never your card number; and consent-based site analytics and product events used to operate and improve the service." },
        { title: "2. How we use your data", body: "We use your data to create and deliver songs, process payments, send transactional messages, provide support, prevent abuse, and improve the product. Marketing email is sent only with consent and includes an unsubscribe link." },
        { title: "3. AI processing and model training", body: "AI providers process story data to generate the parts of your order. We do not use stories, uploads, or finished songs to train models unless you explicitly opt in." },
        { title: "4. Who we share data with", body: "We share only necessary data with service processors such as Supabase, Stripe, Vercel, Resend, and generation providers. Each receives only what it needs. We never sell personal data." },
        { title: "5. Sharing pages", body: "Delivered songs use an unguessable listening link. You can choose private, password-protected, unlisted, or public access from your dashboard. A song is not listed publicly unless you choose public access or submit it as an example or review." },
        { title: "6. Retention and deletion", body: "We retain delivered work so your lifetime license remains useful. You can export data or request deletion. We remove personal data within 30 days except records required for legal, fraud-prevention, or accounting purposes." },
        { title: "7. Security", body: "Traffic uses TLS encryption. Uploads use private storage and signed, expiring links. Production access is limited to people who need it to run the service." },
        { title: "8. Your rights", body: "Depending on your location, you may access, correct, export, delete, or object to certain processing of personal data. Contact us and we will honor verified requests as required by applicable law." },
        { title: "9. Children", body: "The service is intended for adults and we do not knowingly collect data directly from children under 16. Adults may create songs about children using information they are authorized to provide." },
        { title: "10. Contact", body: "For privacy questions or verified rights requests, email {email}. We aim to respond within 30 days." },
      ],
    },
    refunds: {
      title: "Refund Policy", updated: "Last updated August 12, 2026",
      intro: "Every song is made to order, so our policy is revision-first: if something is off, we fix it. If we cannot make it right, we refund you.",
      sections: [
        { title: "1. Before production", body: "You can cancel for a full refund before production starts. Once production is underway, cancellation is unavailable, but the quality guarantee still applies." },
        { title: "2. Our quality guarantee", body: "Report a material quality issue—such as facts that conflict with your brief, the wrong selected genre, or audio defects—within 14 days of delivery. We first use included revisions to fix it at no cost. If we still cannot deliver a usable song, we issue a full refund." },
        { title: "3. What is not covered", body: "Subjective taste alone is handled through revision credits and does not automatically qualify for a refund. Incorrect customer-provided details and requests made more than 14 days after delivery are generally not covered. We review edge cases individually." },
        { title: "4. Non-delivery", body: "If we do not deliver the song, we issue a full refund. If we miss a paid rush deadline, we refund the rush fee." },
        { title: "5. How to request a refund", body: "Email {email} with your order number and a short description. We aim to respond within two business days. Approved refunds return to the original payment method and normally appear within 5–10 business days." },
      ],
    },
  },
  fr: {
    terms: {
      title: "Conditions d'utilisation", updated: "Dernière mise à jour : 12 août 2026",
      intro: "Ces conditions régissent votre utilisation de Memories to Melody (« nous ») sur memoriestomelody.com. En passant commande ou en créant un compte, vous les acceptez.",
      sections: [
        { title: "1. Notre service", body: "Memories to Melody crée des chansons personnalisées à partir des histoires, prénoms et préférences fournis. Chaque commande comprend les éléments affichés pour le forfait lors de l'achat, ainsi que les délais cibles et crédits de révision indiqués." },
        { title: "2. Votre contenu et la licence accordée", body: "Vous confirmez avoir le droit de partager chaque histoire, prénom, photo et autre élément transmis. Vous en conservez la propriété et nous accordez une licence limitée au traitement nécessaire à l'exécution et au support de la commande. Aucun entraînement d'IA n'a lieu sans votre accord explicite." },
        { title: "3. Votre licence sur la chanson", body: "Chaque forfait inclut une licence personnelle à vie : écoute, téléchargement, partage du lien privé, événements privés et réseaux sociaux personnels. La publicité, la monétisation, la revente, la diffusion ou tout autre usage commercial nécessitent une licence distincte." },
        { title: "4. Livraison et révisions", body: "Les délais commencent lorsque le paiement et toutes les informations requises sont complets. Ils sont estimatifs, sauf engagement exprès d'une option urgente payante. Les crédits inclus couvrent des modifications raisonnables dans le cadre de l'histoire et de l'occasion d'origine." },
        { title: "5. Paiement", body: "Les prix et taxes estimées sont affichés lors du paiement. Stripe traite le règlement ; nous ne stockons pas les données de carte. Les codes promotionnels ne sont pas rétroactifs." },
        { title: "6. Utilisation acceptable", body: "Les contenus illicites, haineux, harcelants, diffamatoires, les usurpations sans consentement et les contenus sexuels impliquant des mineurs sont interdits. Il est également interdit de perturber, extraire ou revendre le service sans autorisation." },
        { title: "7. Comptes", body: "Vous êtes responsable de la sécurité de vos identifiants et de l'activité du compte. Vous pouvez demander sa suppression, sous réserve des durées de conservation prévues par notre Politique de confidentialité." },
        { title: "8. Garanties et responsabilité", body: "Le service est fourni en l'état. Dans les limites permises par la loi, notre responsabilité totale pour une commande est limitée au montant payé et exclut les pertes indirectes. Les responsabilités que la loi interdit de limiter restent inchangées." },
        { title: "9. Modifications", body: "Nous pouvons actualiser ces conditions. Toute modification importante sera publiée ici avec une nouvelle date. Une commande reste régie par les conditions en vigueur au moment où elle a été passée." },
        { title: "10. Contact", body: "Pour toute question sur ces conditions, écrivez à {email}." },
      ],
    },
    privacy: {
      title: "Politique de confidentialité", updated: "Dernière mise à jour : 12 août 2026",
      intro: "Vos chansons reposent sur des histoires personnelles. Cette politique explique les données collectées, leur finalité et vos choix.",
      sections: [
        { title: "1. Données collectées", body: "Nous collectons les données de compte, les informations de commande, de destinataire, d'histoire et de musique, les fichiers privés facultatifs, le total et le statut de paiement transmis par Stripe (jamais le numéro de carte), ainsi que les mesures d'usage autorisées." },
        { title: "2. Utilisation", body: "Nous utilisons ces données pour créer et livrer les chansons, traiter les paiements, envoyer des messages transactionnels, fournir l'assistance, prévenir les abus et améliorer le produit. Les e-mails marketing exigent votre consentement." },
        { title: "3. IA et entraînement", body: "Des fournisseurs d'IA traitent les données nécessaires à la génération de votre commande. Vos histoires, fichiers et chansons ne servent pas à entraîner des modèles sans votre accord explicite." },
        { title: "4. Destinataires", body: "Les données nécessaires sont partagées avec Supabase, Stripe, Vercel, Resend et les fournisseurs de génération. Chacun ne reçoit que le nécessaire. Nous ne vendons jamais vos données personnelles." },
        { title: "5. Pages de partage", body: "Les chansons livrées utilisent un lien difficile à deviner. Vous contrôlez le mode privé, protégé par mot de passe, non répertorié ou public. Rien n'est référencé publiquement sans votre choix." },
        { title: "6. Conservation et suppression", body: "Nous conservons les œuvres livrées pour assurer la licence à vie. Vous pouvez exporter vos données ou demander leur suppression. Les données personnelles sont supprimées sous 30 jours, hors obligations légales, comptables ou de prévention de la fraude." },
        { title: "7. Sécurité", body: "Le trafic est chiffré par TLS. Les fichiers sont privés et accessibles par des liens signés temporaires. L'accès à la production est limité aux personnes qui en ont besoin." },
        { title: "8. Vos droits", body: "Selon votre lieu de résidence, vous pouvez accéder à vos données, les corriger, les exporter, les supprimer ou vous opposer à certains traitements. Nous traitons les demandes vérifiées conformément à la loi." },
        { title: "9. Enfants", body: "Le service est destiné aux adultes et nous ne collectons pas sciemment de données directement auprès des moins de 16 ans. Un adulte peut créer une chanson sur un enfant avec les informations qu'il est autorisé à fournir." },
        { title: "10. Contact", body: "Pour toute question ou demande relative à vos droits, écrivez à {email}. Nous visons une réponse sous 30 jours." },
      ],
    },
    refunds: {
      title: "Politique de remboursement", updated: "Dernière mise à jour : 12 août 2026",
      intro: "Chaque chanson est créée sur mesure. Nous privilégions donc la révision : si un élément ne convient pas, nous le corrigeons ; si nous n'y parvenons pas, nous remboursons.",
      sections: [
        { title: "1. Avant la production", body: "Vous pouvez annuler et obtenir un remboursement intégral avant le début de la production. Une fois celle-ci commencée, l'annulation n'est plus possible, mais la garantie qualité reste applicable." },
        { title: "2. Garantie qualité", body: "Signalez dans les 14 jours un problème matériel : faits contraires au brief, mauvais genre sélectionné ou défaut audio. Nous le corrigeons d'abord gratuitement avec les révisions incluses. Si aucune chanson utilisable ne peut être livrée, nous remboursons intégralement." },
        { title: "3. Exclusions", body: "Une préférence subjective relève des crédits de révision et n'ouvre pas automatiquement droit à remboursement. Les informations erronées fournies par le client et les demandes après 14 jours ne sont généralement pas couvertes. Les cas particuliers sont examinés individuellement." },
        { title: "4. Non-livraison", body: "Si la chanson n'est pas livrée, nous remboursons intégralement. Si un délai urgent payant n'est pas respecté, les frais urgents sont remboursés." },
        { title: "5. Demande de remboursement", body: "Écrivez à {email} avec le numéro de commande et une brève description. Nous visons une réponse sous deux jours ouvrés. Le remboursement est renvoyé au moyen de paiement initial et apparaît généralement sous 5 à 10 jours ouvrés." },
      ],
    },
  },
  es: {
    terms: {
      title: "Términos del servicio", updated: "Última actualización: 12 de agosto de 2026",
      intro: "Estos términos rigen el uso de Memories to Melody («nosotros») en memoriestomelody.com. Al hacer un pedido o crear una cuenta, los aceptas.",
      sections: [
        { title: "1. Qué ofrecemos", body: "Memories to Melody crea canciones personalizadas con las historias, nombres y preferencias que proporcionas. Cada pedido incluye lo mostrado para el paquete al comprar, junto con los plazos y créditos de revisión indicados." },
        { title: "2. Tu contenido y la licencia", body: "Confirmas que tienes derecho a compartir cada historia, nombre, foto y elemento enviado. Conservas su propiedad y nos das una licencia limitada para procesarlo únicamente al completar y dar soporte al pedido. No lo usamos para entrenar IA sin tu consentimiento explícito." },
        { title: "3. Tu licencia sobre la canción", body: "Cada paquete incluye una licencia personal de por vida: escuchar, descargar, compartir el enlace privado, reproducir en eventos privados y publicar en cuentas sociales personales. Publicidad, monetización, reventa, emisión u otro uso comercial requieren otra licencia." },
        { title: "4. Entrega y revisiones", body: "Los plazos empiezan cuando el pago y los datos necesarios están completos. Son estimaciones de buena fe salvo compromiso expreso de una opción urgente de pago. Los créditos incluidos cubren cambios razonables dentro de la historia y ocasión originales." },
        { title: "5. Pago", body: "Los precios e impuestos estimados aparecen al pagar. Stripe procesa el pago; no guardamos datos de tarjetas. Los cupones no pueden aplicarse retroactivamente." },
        { title: "6. Uso aceptable", body: "No puedes crear contenido ilegal, de odio, acoso, difamación, suplantación sin consentimiento ni contenido sexual con menores. Tampoco puedes interrumpir, extraer o revender el servicio sin permiso." },
        { title: "7. Cuentas", body: "Eres responsable de proteger tus credenciales y la actividad de tu cuenta. Puedes pedir su eliminación, sujeta a la conservación descrita en la Política de privacidad." },
        { title: "8. Exenciones y responsabilidad", body: "El servicio se ofrece tal cual. En la medida permitida por ley, nuestra responsabilidad total por un pedido se limita a lo pagado y excluye daños indirectos. Esto no limita responsabilidades que legalmente no puedan limitarse." },
        { title: "9. Cambios", body: "Podemos actualizar estos términos. Los cambios importantes se publicarán aquí con una nueva fecha. Cada pedido se rige por los términos vigentes cuando se realizó." },
        { title: "10. Contacto", body: "Para preguntas sobre estos términos, escribe a {email}." },
      ],
    },
    privacy: {
      title: "Política de privacidad", updated: "Última actualización: 12 de agosto de 2026",
      intro: "Tus canciones nacen de historias personales. Esta política explica qué recopilamos, por qué y qué opciones tienes.",
      sections: [
        { title: "1. Qué recopilamos", body: "Recopilamos datos de cuenta; datos del pedido, destinatario, historia y música; archivos privados opcionales; importes y estado del pago enviados por Stripe, nunca el número de tarjeta; y analítica consentida y eventos necesarios para operar y mejorar." },
        { title: "2. Cómo usamos los datos", body: "Los usamos para crear y entregar canciones, procesar pagos, enviar mensajes transaccionales, ofrecer soporte, prevenir abusos y mejorar el producto. El correo de marketing requiere consentimiento e incluye baja." },
        { title: "3. IA y entrenamiento", body: "Proveedores de IA procesan los datos necesarios para generar tu pedido. No usamos historias, archivos ni canciones terminadas para entrenar modelos sin tu consentimiento explícito." },
        { title: "4. Con quién compartimos", body: "Compartimos solo lo necesario con Supabase, Stripe, Vercel, Resend y proveedores de generación. Cada uno recibe únicamente lo que necesita. Nunca vendemos datos personales." },
        { title: "5. Páginas compartidas", body: "Las canciones usan un enlace difícil de adivinar. Puedes elegir acceso privado, con contraseña, no listado o público. Nada se lista públicamente sin tu elección." },
        { title: "6. Conservación y eliminación", body: "Conservamos las obras entregadas para mantener la licencia de por vida. Puedes exportar o pedir la eliminación. Eliminamos los datos personales en 30 días salvo obligaciones legales, contables o antifraude." },
        { title: "7. Seguridad", body: "El tráfico usa cifrado TLS. Los archivos están en almacenamiento privado con enlaces firmados temporales. El acceso de producción se limita a quien lo necesita." },
        { title: "8. Tus derechos", body: "Según tu ubicación, puedes acceder, corregir, exportar, eliminar u oponerte a ciertos tratamientos. Atendemos solicitudes verificadas conforme a la ley aplicable." },
        { title: "9. Menores", body: "El servicio está destinado a adultos y no recopilamos conscientemente datos directamente de menores de 16 años. Un adulto puede crear una canción sobre un menor con datos que esté autorizado a proporcionar." },
        { title: "10. Contacto", body: "Para preguntas o solicitudes de privacidad, escribe a {email}. Intentamos responder en 30 días." },
      ],
    },
    refunds: {
      title: "Política de reembolso", updated: "Última actualización: 12 de agosto de 2026",
      intro: "Cada canción se hace a medida, por lo que primero revisamos: si algo falla, lo corregimos; si no podemos solucionarlo, te reembolsamos.",
      sections: [
        { title: "1. Antes de la producción", body: "Puedes cancelar con reembolso total antes de que empiece la producción. Una vez iniciada, no se puede cancelar, pero la garantía de calidad sigue aplicándose." },
        { title: "2. Garantía de calidad", body: "Informa en 14 días de un problema material: hechos contrarios al brief, género seleccionado incorrecto o defectos de audio. Primero lo corregimos sin coste con las revisiones incluidas. Si no podemos entregar una canción utilizable, emitimos un reembolso total." },
        { title: "3. Exclusiones", body: "El gusto subjetivo se atiende con créditos de revisión y no da derecho automático a reembolso. Los datos incorrectos aportados por el cliente y solicitudes pasados 14 días normalmente no están cubiertos. Evaluamos casos excepcionales individualmente." },
        { title: "4. Falta de entrega", body: "Si no entregamos la canción, emitimos un reembolso total. Si incumplimos un plazo urgente pagado, reembolsamos esa tarifa." },
        { title: "5. Cómo solicitarlo", body: "Escribe a {email} con el número de pedido y una breve descripción. Intentamos responder en dos días laborables. El reembolso vuelve al método original y suele aparecer en 5–10 días laborables." },
      ],
    },
  },
  ar: {
    terms: {
      title: "شروط الخدمة", updated: "آخر تحديث: 12 أغسطس 2026",
      intro: "تحكم هذه الشروط استخدامك لخدمة Memories to Melody («نحن») على memoriestomelody.com. عند تقديم طلب أو إنشاء حساب فإنك توافق عليها.",
      sections: [
        { title: "1. ما نقدمه", body: "تنشئ Memories to Melody أغاني مخصّصة من القصص والأسماء والتفضيلات التي تقدمها. يتضمن كل طلب العناصر المعروضة ضمن الباقة عند الشراء، مع مواعيد التسليم المستهدفة وأرصدة التعديل الموضحة." },
        { title: "2. محتواك والترخيص الممنوح لنا", body: "تؤكد امتلاكك حق مشاركة كل قصة واسم وصورة وعنصر ترسله. تحتفظ بالملكية وتمنحنا ترخيصًا محدودًا لمعالجته فقط لتنفيذ طلبك ودعمه. لا نستخدمه لتدريب نماذج الذكاء الاصطناعي إلا بموافقتك الصريحة." },
        { title: "3. ترخيصك للأغنية النهائية", body: "تتضمن كل باقة ترخيص استخدام شخصي مدى الحياة: الاستماع والتنزيل ومشاركة الرابط الخاص وتشغيل الأغنية في مناسبات خاصة ونشرها على حساباتك الشخصية. يتطلب الإعلان أو تحقيق الدخل أو إعادة البيع أو البث أو أي استخدام تجاري ترخيصًا منفصلًا." },
        { title: "4. التسليم والتعديلات", body: "تبدأ المدة عند اكتمال الدفع وكل تفاصيل القصة المطلوبة. وهي تقديرات بحسن نية ما لم ينص خيار عاجل مدفوع صراحة على خلاف ذلك. تغطي أرصدة التعديل تغييرات معقولة ضمن القصة والمناسبة الأصليتين." },
        { title: "5. الدفع", body: "تظهر الأسعار والضرائب التقديرية عند الدفع. تعالج Stripe المدفوعات ولا نخزن بيانات البطاقة. لا تُطبّق رموز الخصم بأثر رجعي." },
        { title: "6. الاستخدام المقبول", body: "يُحظر المحتوى غير القانوني أو المحرض على الكراهية أو المضايق أو التشهيري أو انتحال الأشخاص دون موافقتهم أو المحتوى الجنسي المتعلق بقاصرين. كما يُحظر تعطيل الخدمة أو استخراجها أو إعادة بيعها دون إذن." },
        { title: "7. الحسابات", body: "أنت مسؤول عن حماية بيانات الدخول ونشاط حسابك. يمكنك طلب حذف الحساب وفق مدد الاحتفاظ الموضحة في سياسة الخصوصية." },
        { title: "8. إخلاء المسؤولية وحدودها", body: "تُقدم الخدمة بحالتها الراهنة. إلى أقصى حد يسمح به القانون، تقتصر مسؤوليتنا الإجمالية عن الطلب على المبلغ المدفوع ولا تشمل الخسائر غير المباشرة. لا ينطبق ذلك على مسؤولية لا يجيز القانون تقييدها." },
        { title: "9. تعديل الشروط", body: "قد نحدّث هذه الشروط مع تطور الخدمة. تُنشر التغييرات المهمة هنا بتاريخ جديد. يظل كل طلب خاضعًا للشروط السارية وقت تقديمه." },
        { title: "10. التواصل", body: "للأسئلة حول هذه الشروط، راسلنا على {email}." },
      ],
    },
    privacy: {
      title: "سياسة الخصوصية", updated: "آخر تحديث: 12 أغسطس 2026",
      intro: "تعتمد أغانيك على قصص شخصية، لذلك الخصوصية أساسية في عمل Memories to Melody. توضح هذه السياسة ما نجمعه ولماذا وخياراتك.",
      sections: [
        { title: "1. ما نجمعه", body: "نجمع بيانات الحساب؛ ومعلومات الطلب والمُهدى إليه والقصة والموسيقى؛ والملفات الخاصة الاختيارية؛ وإجمالي الدفع وحالته من Stripe دون رقم بطاقتك؛ والتحليلات التي وافقت عليها وأحداث المنتج اللازمة للتشغيل والتحسين." },
        { title: "2. كيفية الاستخدام", body: "نستخدم البيانات لإنشاء الأغاني وتسليمها ومعالجة الدفع وإرسال رسائل المعاملات وتقديم الدعم ومنع الإساءة وتحسين المنتج. لا نرسل تسويقًا بالبريد دون موافقتك ويتضمن رابط إلغاء الاشتراك." },
        { title: "3. معالجة الذكاء الاصطناعي والتدريب", body: "يعالج مزودو الذكاء الاصطناعي البيانات اللازمة لإنشاء طلبك. لا نستخدم القصص أو الملفات أو الأغاني النهائية لتدريب النماذج دون موافقتك الصريحة." },
        { title: "4. مشاركة البيانات", body: "نشارك الضروري فقط مع Supabase وStripe وVercel وResend ومزودي الإنشاء. يتلقى كل مزود ما يحتاجه فقط. لا نبيع بياناتك الشخصية." },
        { title: "5. صفحات المشاركة", body: "تستخدم الأغاني رابطًا يصعب تخمينه. يمكنك اختيار وصول خاص أو محمي بكلمة مرور أو غير مدرج أو عام. لا ندرج شيئًا للعامة دون اختيارك." },
        { title: "6. الاحتفاظ والحذف", body: "نحتفظ بالأعمال المسلمة ليستمر ترخيصك مدى الحياة. يمكنك تصدير البيانات أو طلب الحذف. نحذف البيانات الشخصية خلال 30 يومًا باستثناء السجلات المطلوبة قانونيًا أو محاسبيًا أو لمكافحة الاحتيال." },
        { title: "7. الأمان", body: "تُشفّر حركة البيانات عبر TLS. تُحفظ الملفات في تخزين خاص بروابط موقعة ومؤقتة. يقتصر الوصول إلى الإنتاج على من يحتاجه لتشغيل الخدمة." },
        { title: "8. حقوقك", body: "بحسب موقعك قد يحق لك الوصول إلى بياناتك أو تصحيحها أو تصديرها أو حذفها أو الاعتراض على بعض المعالجة. نستجيب للطلبات المتحقق منها وفق القانون المعمول به." },
        { title: "9. الأطفال", body: "الخدمة مخصصة للبالغين ولا نجمع عن علم بيانات مباشرة من أطفال دون 16 عامًا. يمكن للبالغ إنشاء أغنية عن طفل بمعلومات يحق له تقديمها." },
        { title: "10. التواصل", body: "لأسئلة الخصوصية أو طلبات الحقوق، راسلنا على {email}. نهدف للرد خلال 30 يومًا." },
      ],
    },
    refunds: {
      title: "سياسة الاسترداد", updated: "آخر تحديث: 12 أغسطس 2026",
      intro: "كل أغنية مصنوعة حسب الطلب، لذلك نبدأ بالتعديل: إن كان هناك خلل نصلحه، وإن تعذر تصحيحه نعيد إليك المبلغ.",
      sections: [
        { title: "1. قبل بدء الإنتاج", body: "يمكنك الإلغاء واسترداد المبلغ كاملًا قبل بدء الإنتاج. بعد بدئه لا يتوفر الإلغاء، لكن يظل ضمان الجودة ساريًا." },
        { title: "2. ضمان الجودة", body: "أبلغنا خلال 14 يومًا عن مشكلة جوهرية مثل معلومات تخالف ملخصك أو نمط موسيقي غير الذي اخترته أو عيوب صوتية. نستخدم أولًا التعديلات المشمولة لإصلاحها دون تكلفة. إن تعذر تسليم أغنية صالحة نعيد المبلغ كاملًا." },
        { title: "3. ما لا يغطيه الضمان", body: "الذوق الشخصي يعالج عبر أرصدة التعديل ولا يوجب الاسترداد تلقائيًا. لا تُغطى عادة المعلومات الخاطئة التي قدمها العميل أو الطلبات بعد 14 يومًا. نراجع الحالات الاستثنائية بصورة فردية." },
        { title: "4. عدم التسليم", body: "إن لم نسلّم الأغنية نعيد المبلغ كاملًا. وإن فات موعد عاجل مدفوع نعيد رسوم الاستعجال." },
        { title: "5. طلب الاسترداد", body: "راسل {email} برقم الطلب ووصف موجز. نهدف للرد خلال يومي عمل. يعود المبلغ إلى وسيلة الدفع الأصلية ويظهر عادة خلال 5–10 أيام عمل." },
      ],
    },
  },
};
