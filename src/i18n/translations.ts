export type Language = 'en' | 'hi';

export interface TranslationDictionary {
  // Navigation Tabs
  tabHome: string;
  tabSocial: string;
  tabMarket: string;
  tabBusiness: string;
  tabProfile: string;

  // Common UI
  searchPlaceholder: string;
  cancel: string;
  confirm: string;
  apply: string;
  close: string;
  save: string;
  loading: string;
  success: string;
  error: string;
  active: string;
  manage: string;
  open: string;
  view: string;

  // Home Screen
  homeGreeting: string;
  customerPassport: string;
  quickActions: string;
  purchaseBookVault: string;
  purchaseBookDesc: string;
  tredCoinsLoyalty: string;
  tredCoinsDesc: string;
  nearbyShops: string;
  directChat: string;
  activeOrderTracking: string;
  orderPlaced: string;
  orderPreparing: string;
  orderDispatched: string;
  orderDelivered: string;
  trendingCategories: string;

  // Social / Chat Screen
  chatTitle: string;
  storiesTitle: string;
  unreadMessages: string;
  payViaUpi: string;
  invoiceReceived: string;

  // Market Screen
  marketplaceTitle: string;
  radiusFilter: string;
  verifiedMerchant: string;
  addToCart: string;
  viewCart: string;
  checkout: string;
  singleMerchantAlert: string;

  // Business Screen
  businessWorkspace: string;
  overviewTab: string;
  ordersTab: string;
  inventoryTab: string;
  todaysRevenue: string;
  activeOrders: string;
  liveCatalog: string;
  lowStockAlert: string;
  published: string;
  hidden: string;
  printThermalReceipt: string;
  openWebErp: string;
  scanBarcode: string;

  // Profile Screen
  profileTitle: string;
  reputationPassport: string;
  businessContext: string;
  subscriptionsPlans: string;
  superAdminWorkbench: string;
  deviceSessions: string;
  biometricLogin: string;
  logOut: string;
  languageSelect: string;

  // Scanner & Hardware
  scannerTitle: string;
  scannerSubtitle: string;
  scanProductBarcode: string;
  scanCustomerQr: string;
  scanUpiQr: string;
  barcodeScannedSuccess: string;

  // Device Sessions
  sessionTitle: string;
  sessionSubtitle: string;
  currentDevice: string;
  logOutAllOther: string;
  lastActive: string;

  // Loyalty & Referrals
  referralAndRewards: string;
  referralTitle: string;
  referralSubtitle: string;
  copyCode: string;
  shareWhatsapp: string;
  friendsReferred: string;
  coinsEarned: string;
  claimReferral: string;
  merchantLoyaltySettings: string;
  loyaltySubtitle: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    // Navigation Tabs
    tabHome: 'Home',
    tabSocial: 'Social',
    tabMarket: 'Market',
    tabBusiness: 'Business',
    tabProfile: 'Profile',

    // Common UI
    searchPlaceholder: 'Search products, stores & invoices...',
    cancel: 'Cancel',
    confirm: 'Confirm',
    apply: 'Apply',
    close: 'Close',
    save: 'Save',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    active: 'Active',
    manage: 'Manage',
    open: 'Open',
    view: 'View',

    // Home Screen
    homeGreeting: 'Hello',
    customerPassport: 'Customer Passport',
    quickActions: 'Quick Services',
    purchaseBookVault: 'Purchase Book Vault',
    purchaseBookDesc: 'View bills, warranties & GST invoices',
    tredCoinsLoyalty: 'TredCoins Rewards',
    tredCoinsDesc: 'Loyalty balance & reward credits',
    nearbyShops: 'Nearby Shops',
    directChat: 'Direct Chat',
    activeOrderTracking: 'Live Order Tracking',
    orderPlaced: 'Placed',
    orderPreparing: 'Preparing',
    orderDispatched: 'Dispatched',
    orderDelivered: 'Delivered',
    trendingCategories: 'Trending Categories',

    // Social / Chat Screen
    chatTitle: 'Communication Hub',
    storiesTitle: '24-Hour Broadcast Stories',
    unreadMessages: 'unread',
    payViaUpi: 'Pay via UPI',
    invoiceReceived: 'GST Invoice Received',

    // Market Screen
    marketplaceTitle: 'Hyper-Local Marketplace',
    radiusFilter: 'Geo-Radius',
    verifiedMerchant: 'GST Verified',
    addToCart: 'Add to Cart',
    viewCart: 'View Basket',
    checkout: 'Checkout',
    singleMerchantAlert: 'Cart can only contain items from one shop at a time.',

    // Business Screen
    businessWorkspace: 'Merchant Workspace',
    overviewTab: 'Overview',
    ordersTab: 'Orders',
    inventoryTab: 'Inventory',
    todaysRevenue: "Today's Revenue",
    activeOrders: 'Active Orders',
    liveCatalog: 'Live Catalog',
    lowStockAlert: 'Low Stock',
    published: 'Published',
    hidden: 'Hidden',
    printThermalReceipt: 'Print Thermal Receipt',
    openWebErp: 'Open Web Accounting ERP',
    scanBarcode: 'Scan Barcode',

    // Profile Screen
    profileTitle: 'User Profile & Identity',
    reputationPassport: 'Commercial Reputation Passport',
    businessContext: 'Business & Company Context',
    subscriptionsPlans: 'Plans, Quotas & Subscriptions',
    superAdminWorkbench: 'Super Admin Workbench',
    deviceSessions: 'Active Device Sessions',
    biometricLogin: 'Fingerprint / FaceID Login',
    logOut: 'Log Out from TredBook',
    languageSelect: 'App Language / भाषा',

    // Scanner & Hardware
    scannerTitle: 'Universal Scanner Bridge',
    scannerSubtitle: 'Scan product barcodes, customer passports or UPI codes',
    scanProductBarcode: 'Scan Product Barcode',
    scanCustomerQr: 'Scan Customer QR',
    scanUpiQr: 'Scan UPI Payment QR',
    barcodeScannedSuccess: 'Barcode Scanned Successfully',

    // Device Sessions
    sessionTitle: 'Active Device Sessions',
    sessionSubtitle: 'Manage devices currently logged into your TredBook account',
    currentDevice: 'Current Device',
    logOutAllOther: 'Log Out From All Other Devices',
    lastActive: 'Last active',

    // Loyalty & Referrals
    referralAndRewards: 'Refer & Earn Rewards',
    referralTitle: 'Customer Referral Network',
    referralSubtitle: 'Share TredBook with friends and earn TredCoins on their first purchase',
    copyCode: 'Copy Code',
    shareWhatsapp: 'Share via WhatsApp',
    friendsReferred: 'Friends Referred',
    coinsEarned: 'Total Coins Earned',
    claimReferral: 'Have a Referral Code?',
    merchantLoyaltySettings: 'Merchant Loyalty Program',
    loyaltySubtitle: 'Configure point accruals and redemption discounts for customers',
  },
  hi: {
    // Navigation Tabs
    tabHome: 'होम',
    tabSocial: 'संवाद',
    tabMarket: 'बाज़ार',
    tabBusiness: 'व्यापार',
    tabProfile: 'प्रोफ़ाइल',

    // Common UI
    searchPlaceholder: 'उत्पाद, दुकानें और बिल खोजें...',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    apply: 'लागू करें',
    close: 'बंद करें',
    save: 'सहेजें',
    loading: 'लोड हो रहा है...',
    success: 'सफलता',
    error: 'त्रुटि',
    active: 'सक्रिय',
    manage: 'प्रबंधित करें',
    open: 'खोलें',
    view: 'देखें',

    // Home Screen
    homeGreeting: 'नमस्ते',
    customerPassport: 'ग्राहक पासपोर्ट',
    quickActions: 'त्वरित सेवाएं',
    purchaseBookVault: 'डिजिटल खरीद खाता (Purchase Book)',
    purchaseBookDesc: 'बिल, वारंटी और जीएसटी रसीदें देखें',
    tredCoinsLoyalty: 'ट्रेडकॉइन्स रिवार्ड्स',
    tredCoinsDesc: 'लॉयल्टी बैलेंस और रिवार्ड क्रेडिट्स',
    nearbyShops: 'आस-पास की दुकानें',
    directChat: 'सीधी बातचीत',
    activeOrderTracking: 'लाइव ऑर्डर ट्रैकिंग',
    orderPlaced: 'दर्ज हुआ',
    orderPreparing: 'तैयारी में',
    orderDispatched: 'रवाना हुआ',
    orderDelivered: 'पहुंच गया',
    trendingCategories: 'लोकप्रिय श्रेणियां',

    // Social / Chat Screen
    chatTitle: 'संवाद और चैट हब',
    storiesTitle: '24-घंटे की व्यापारी स्टोरीज़',
    unreadMessages: 'अपठित',
    payViaUpi: 'UPI द्वारा भुगतान करें',
    invoiceReceived: 'जीएसटी चालान प्राप्त हुआ',

    // Market Screen
    marketplaceTitle: 'स्थानीय बाज़ार (Marketplace)',
    radiusFilter: 'दूरी दायरा',
    verifiedMerchant: 'जीएसटी प्रमाणित',
    addToCart: 'कार्ट में जोड़ें',
    viewCart: 'कार्ट देखें',
    checkout: 'ऑर्डर चेकआउट',
    singleMerchantAlert: 'कार्ट में एक समय में केवल एक ही दुकान के सामान हो सकते हैं।',

    // Business Screen
    businessWorkspace: 'व्यापारी कार्यक्षेत्र (Workspace)',
    overviewTab: 'सारांश',
    ordersTab: 'ऑर्डर्स',
    inventoryTab: 'इन्वेंटरी',
    todaysRevenue: 'आज की बिक्री',
    activeOrders: 'सक्रिय ऑर्डर्स',
    liveCatalog: 'लाइव कैटलॉग',
    lowStockAlert: 'कम स्टॉक',
    published: 'प्रकाशित',
    hidden: 'छिपा हुआ',
    printThermalReceipt: 'थर्मल रसीद प्रिंट करें',
    openWebErp: 'वेब अकाउंटिंग ERP खोलें',
    scanBarcode: 'बारकोड स्कैन करें',

    // Profile Screen
    profileTitle: 'उपयोगकर्ता प्रोफ़ाइल और पहचान',
    reputationPassport: 'व्यापारिक साख पासपोर्ट (TrustScore)',
    businessContext: 'फर्म और व्यापार चयन',
    subscriptionsPlans: 'सब्सक्रिप्शन प्लान और सीमाएं',
    superAdminWorkbench: 'सुपर एडमिन नियंत्रण कक्ष',
    deviceSessions: 'सक्रिय डिवाइस सेशन्स',
    biometricLogin: 'फिंगरप्रिंट / फेस अनलॉक',
    logOut: 'ट्रेडबुक से लॉग आउट करें',
    languageSelect: 'ऐप भाषा (Language)',

    // Scanner & Hardware
    scannerTitle: 'यूनिवर्सल स्कैनर ब्रिज',
    scannerSubtitle: 'उत्पाद बारकोड, ग्राहक पासपोर्ट या UPI क्यूआर स्कैन करें',
    scanProductBarcode: 'उत्पाद बारकोड स्कैन करें',
    scanCustomerQr: 'ग्राहक पासपोर्ट स्कैन करें',
    scanUpiQr: 'UPI क्यूआर स्कैन करें',
    barcodeScannedSuccess: 'बारकोड सफलतापूर्वक स्कैन हुआ',

    // Device Sessions
    sessionTitle: 'सक्रिय डिवाइस सेशन्स',
    sessionSubtitle: 'वर्तमान में आपके खाते से जुड़े सभी डिवाइस प्रबंधित करें',
    currentDevice: 'वर्तमान डिवाइस',
    logOutAllOther: 'अन्य सभी डिवाइस से लॉग आउट करें',
    lastActive: 'अंतिम सक्रियता',

    // Loyalty & Referrals
    referralAndRewards: 'रेफर करें और रिवॉर्ड्स कमाएं',
    referralTitle: 'ग्राहक रेफरल नेटवर्क',
    referralSubtitle: 'मित्रों के साथ ट्रेडबुक शेयर करें और उनके पहले ऑर्डर पर ट्रेडकॉइन कमाएं',
    copyCode: 'कोड कॉपी करें',
    shareWhatsapp: 'व्हाट्सएप पर शेयर करें',
    friendsReferred: 'रेफर किए गए मित्र',
    coinsEarned: 'कुल अर्जित सिक्के',
    claimReferral: 'क्या आपके पास रेफरल कोड है?',
    merchantLoyaltySettings: 'व्यापारी लॉयल्टी प्रोग्राम',
    loyaltySubtitle: 'ग्राहकों के लिए अंक अर्जन और छूट की सीमाएं सेट करें',
  },
};
