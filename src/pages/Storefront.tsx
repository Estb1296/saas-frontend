import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios, { type AxiosResponse } from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// --- BRAND & WATERMARK ASSETS ---
import logoImg from '../assets/darkLogo.png';

// --- LOCAL ASSETS ---
import cheeseImg from '../assets/cheese.png';
import chickenAndBelgianWafflesImg from '../assets/chickenAndBelgianWaffles.png';
import cluckAndBlazeImg from '../assets/cluckAndBlaze.png';
import coldSlawImg from '../assets/coldSlaw.png';
import extraPicklesImg from '../assets/extraPickles.png';
import filthyFriesImg from '../assets/filthyFries.png';
import fountainDrinkImg from '../assets/fountainDrink.png';
import heavenAndLoveImg from '../assets/heavenAndLove.png';
import holyCowImg from '../assets/holyCow.png';
import hotChickImg from '../assets/hotChick.png';
import hotChick20BuffaloRanchImg from '../assets/hotChick2.0BuffaloRanch.png';
import hotMothaCluckaImg from '../assets/hotMothaClucka.png';
import loveBirdImg from '../assets/loveBird.png';
import redBullImg from '../assets/redBull.png';
import redChickImg from '../assets/redChick.png';
import rrRanchImg from '../assets/rrRanch.png';
import rrSauceImg from '../assets/rrSauce.png';
import seasonedFriesImg from '../assets/seasonedFries.png';
import shutTheCluckUpImg from '../assets/shutTheCluckUp.png';
import sonOfABunImg from '../assets/sonOfABun.png';
import tenderImg from '../assets/tender.png';

// Initialize Stripe with your Test Publishable Key
const stripePromise = loadStripe('pk_test_your_publishable_key_here');

// --- STRIPE CARD FORM COMPONENT ---
function CheckoutForm({
                        clientSecret,
                        orderId,
                        onSuccess,
                        onBack,
                      }: {
  clientSecret: string;
  orderId: number;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardHolderName, setCardHolderName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage('');

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setLoading(false);
      return;
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: cardHolderName || 'Guest Customer',
        },
      },
    });

    if (result.error) {
      setErrorMessage(result.error.message || 'Payment failed');
      setLoading(false);
    } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
      setLoading(false);
      onSuccess();
    }
  };

  return (
      <form onSubmit={handleSubmit} style={styles.paymentForm}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#0f172a' }}>
          Enter Payment Details for Order #{orderId}
        </h3>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569', fontWeight: '600' }}>
            Cardholder Name
          </label>
          <input
              type="text"
              placeholder="Jane Doe"
              value={cardHolderName}
              onChange={(e) => setCardHolderName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                fontSize: '1rem',
              }}
          />
        </div>

        <div style={{ marginBottom: '1.25rem', padding: '1rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', backgroundColor: '#f8fafc' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569', fontWeight: '600' }}>
            Card Information
          </label>
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#0f172a',
                '::placeholder': { color: '#94a3b8' },
              },
            },
          }} />
        </div>

        {errorMessage && <p style={{ color: '#dc2626', fontSize: '0.9rem', marginBottom: '1rem' }}>{errorMessage}</p>}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          <button type="button" onClick={onBack} style={styles.backBtn}>
            Back
          </button>
          <button type="submit" disabled={!stripe || loading} style={styles.checkoutBtn}>
            {loading ? 'Processing Payment...' : 'Pay Now 🔥'}
          </button>
        </div>
      </form>
  );
}

// --- TYPESCRIPT INTERFACES ---
interface MenuItem {
  id: number;
  name: string;
  categoryName: string;
  price: number;
  description: string;
  image?: string;
  isSpicy?: boolean;
  category?: { name: string };
}

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  status?: string;
  menuItems: MenuItem[];
}

interface HeatLevel {
  id: string;
  label: string;
  icon: string;
  color: string;
  desc: string;
}

interface CartItem {
  cartId: string;
  id: number;
  name: string;
  price: number;
  heat: HeatLevel | null;
  quantity: number;
  instructions: string;
  image?: string;
}

interface UpsellItem {
  id: number;
  name: string;
  price: number;
  desc: string;
  image?: string;
}

// --- EXACT NAME MAPPING TO MATCH ASSETS ---
const ASSET_IMAGE_MAP: Record<string, string> = {
  'heaven & love': heavenAndLoveImg,
  'heaven and love': heavenAndLoveImg,
  'hot motha clucka': hotMothaCluckaImg,
  'shut the cluck up': shutTheCluckUpImg,
  'red chick': redChickImg,
  'hot chick 2.0': hotChick20BuffaloRanchImg,
  'hot chick': hotChickImg,
  'cluck and blaze': cluckAndBlazeImg,
  'cluck & blaze': cluckAndBlazeImg,
  'love bird': loveBirdImg,
  'chicken & belgian': chickenAndBelgianWafflesImg,
  'chicken and belgian': chickenAndBelgianWafflesImg,
  'waffles': chickenAndBelgianWafflesImg,
  'son of a bun': sonOfABunImg,
  'holy cow': holyCowImg,
  'red bull': redBullImg,
  'filthy fries': filthyFriesImg,
  'seasoned fries': seasonedFriesImg,
  'fries': seasonedFriesImg,
  'slaw': coldSlawImg,
  'coleslaw': coldSlawImg,
  'tender': tenderImg,
  'rr sauce': rrSauceImg,
  'sauce': rrSauceImg,
  'rr ranch': rrRanchImg,
  'ranch': rrRanchImg,
  'cheese': cheeseImg,
  'pickles': extraPicklesImg,
  'fountain drink': fountainDrinkImg,
  'drink': fountainDrinkImg,
};

// --- FOUNTAIN DRINK OPTIONS ---
const FOUNTAIN_DRINKS = [
  'Coke',
  'Diet Coke',
  'Sprite',
  'Dr. Pepper',
  'Sunkist',
  'Pink Lemonade',
  'Water',
];

const DRINK_SIZES = [
  { id: 'medium', label: 'Medium', price: 2.50 },
  { id: 'large', label: 'Large', price: 3.00 },
];

const CHEESE_OPTIONS = [
  'American',
  'Pepper Jack',
  'Cheddar',
  'Swiss',
];

const itemHasHeatOption = (name: string): boolean => {
  const lower = name.toLowerCase();
  if (lower.includes('love bird') || lower.includes('waffles') || lower.includes('belgian')) {
    return false;
  }
  return (
      lower.includes('heaven & love') ||
      lower.includes('heaven and love') ||
      lower.includes('hot motha clucka') ||
      lower.includes('shut the cluck up') ||
      lower.includes('red chick') ||
      lower.includes('hot chick') ||
      lower.includes('cluck and blaze') ||
      lower.includes('cluck & blaze')
  );
};

const itemIsFountainDrink = (name: string): boolean => {
  const lower = name.toLowerCase();
  return lower.includes('fountain drink') || lower.includes('drink');
};

const itemIsCheese = (name: string): boolean => {
  const lower = name.toLowerCase();
  return lower.includes('cheese');
};

const DEMO_RESTAURANT: Restaurant = {
  id: 1,
  name: 'ROOSTER ROO',
  slug: 'rooster-roo',
  address: '1234 Main St, Rowlett, TX 75088',
  phone: '(972) 555-0199',
  status: 'ACTIVE',
  menuItems: [
    {
      id: 101,
      name: '#1 Heaven & Love',
      categoryName: 'Combos',
      price: 15.0,
      description: '2 Sandwiches w/ slaw, pickles, and RR sauce and a side of fries',
      image: heavenAndLoveImg,
      isSpicy: true,
    },
    {
      id: 102,
      name: '#2 Hot Motha Clucka',
      categoryName: 'Combos',
      price: 13.0,
      description: '1 Sandwich and 1 jumbo tender w/ sliced bread, slaw, pickles, and RR sauce and a side of fries',
      image: hotMothaCluckaImg,
      isSpicy: true,
    },
    {
      id: 103,
      name: '#3 Shut The Cluck Up',
      categoryName: 'Combos',
      price: 12.0,
      description: '3 Tenders w/ sliced bread, pickles, and RR sauce and a side of fries',
      image: shutTheCluckUpImg,
      isSpicy: true,
    },
    {
      id: 104,
      name: '#4 Red Chick',
      categoryName: 'Combos',
      price: 11.0,
      description: '1 Sandwich w/ slaw, pickles, and RR sauce and a side of fries',
      image: redChickImg,
      isSpicy: true,
    },
    {
      id: 105,
      name: '#5 Hot Chick',
      categoryName: 'Combos',
      price: 13.0,
      description: 'Bed of seasoned fries, chopped tenders, cheese, slaw, pickles, and RR sauce',
      image: hotChickImg,
      isSpicy: true,
    },
    {
      id: 106,
      name: '#6 Cluck and Blaze',
      categoryName: 'Combos',
      price: 15.0,
      description: '1 Sandwich & Med #5 (Seasoned fries, chopped tenders, cheese, slaw, and RR sauce)',
      image: cluckAndBlazeImg,
      isSpicy: true,
    },
    {
      id: 107,
      name: '#7 Hot Chick 2.0 Buffalo Ranch',
      categoryName: 'Combos',
      price: 13.0,
      description: 'Bed of seasoned fries, chopped tenders, cheese, slaw, pickles, and RR Buffalo sauce',
      image: hotChick20BuffaloRanchImg,
      isSpicy: true,
    },
    {
      id: 108,
      name: '#8 Love Bird',
      categoryName: 'Combos',
      price: 11.0,
      description: '1 No Heat sandwich w/ lettuce, red onions, pickles, pickled jalapeños, and raw jalapeños and a side of fries',
      image: loveBirdImg,
      isSpicy: false,
    },
    {
      id: 109,
      name: '#9 Chicken & Belgian Pearl Sugar Waffles',
      categoryName: 'Combos',
      price: 17.0,
      description: 'Two waffles topped with powdered sugar, served with two crispy tenders, fresh strawberries, and blueberries',
      image: chickenAndBelgianWafflesImg,
      isSpicy: false,
    },
    {
      id: 110,
      name: '#10 Son of a Bun',
      categoryName: 'Smash Burgers',
      price: 12.5,
      description: 'Double smashed, 2 American cheeses, caramelized onions, pickles, and signature sauce',
      image: sonOfABunImg,
      isSpicy: false,
    },
    {
      id: 111,
      name: '#11 Holy Cow',
      categoryName: 'Smash Burgers',
      price: 14.0,
      description: 'Double smashed, 2 American cheeses, bacon, grilled jalapeños, and spicy blaze sauce',
      image: holyCowImg,
      isSpicy: false,
    },
    {
      id: 112,
      name: '#12 Red Bull',
      categoryName: 'Smash Burgers',
      price: 14.5,
      description: 'Double smashed, 2 pepper jack cheeses, hot chili oil glaze, slaw, and pickles',
      image: redBullImg,
      isSpicy: false,
    },
  ],
};

const HEAT_LEVELS: HeatLevel[] = [
  { id: 'no-heat', label: 'No Heat', icon: '🟢', color: '#10b981', desc: 'Plain Southern Crispy' },
  { id: 'mild', label: 'Mild', icon: '🟡', color: '#f59e0b', desc: 'Gentle warmth & kick' },
  { id: 'medium', label: 'Medium', icon: '🟧', color: '#f97316', desc: 'Perfect balanced spice' },
  { id: 'hot', label: 'Hot', icon: '🔴', color: '#ef4444', desc: 'Serious Nashville heat' },
  { id: 'extra-hot', label: 'Extra Hot', icon: '🔥', color: '#dc2626', desc: 'Tears will flow' },
  { id: 'rr-reaper', label: 'RR Reaper', icon: '💀', color: '#b91c1c', desc: 'Carolina Reaper challenge' },
];

const UPSELL_ITEMS: UpsellItem[] = [
  { id: 201, name: 'RR Sauce', price: 0.50, desc: 'Signature house dipping sauce', image: rrSauceImg },
  { id: 202, name: 'RR Ranch', price: 0.50, desc: 'House ranch dipping sauce', image: rrRanchImg },
  { id: 203, name: 'Pickles', price: 0.50, desc: 'Extra pickles', image: extraPicklesImg },
  { id: 204, name: 'Cheese', price: 0.50, desc: 'Extra cheese slice', image: cheeseImg },
  { id: 205, name: 'Slaw', price: 3.00, desc: 'House-made coleslaw', image: coldSlawImg },
  { id: 206, name: 'Seasoned Fries', price: 3.50, desc: 'Crinkle-cut seasoned fries', image: seasonedFriesImg },
  { id: 207, name: 'Fountain Drink', price: 2.50, desc: 'Coke, Diet Coke, Sprite, Dr. Pepper, Sunkist, Pink Lemonade, and Water', image: fountainDrinkImg },
];

export default function Storefront() {
  const { slug } = useParams<{ slug?: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [scrollY, setScrollY] = useState<number>(0);

  // Stripe Payment State
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);

  // View & Checkout State
  const [currentView, setCurrentView] = useState<'menu' | 'checkout'>('menu');
  const [submittingOrder, setSubmittingOrder] = useState<boolean>(false);

  // Customization Modal State
  const [activeItemModal, setActiveItemModal] = useState<MenuItem | null>(null);
  const [selectedHeat, setSelectedHeat] = useState<HeatLevel>(HEAT_LEVELS[2]);
  const [selectedDrink, setSelectedDrink] = useState<string>('Coke');
  const [selectedDrinkSize, setSelectedDrinkSize] = useState<string>('medium');
  const [selectedCheese, setSelectedCheese] = useState<string>('American');
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');

  // Cart Drawer State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;

    axios
        .get<Restaurant>(
            `http://localhost:8080/api/v1/admin/tenants/public/slug/${slug || 'rooster-roo'}`,
        )
        .then((res: AxiosResponse<Restaurant>) => {
          if (!isMounted) return;
          const fetchedData = res.data;
          if (!fetchedData.menuItems || fetchedData.menuItems.length === 0) {
            fetchedData.menuItems = DEMO_RESTAURANT.menuItems;
          } else {
            fetchedData.menuItems = fetchedData.menuItems.map((item) => {
              const lowerName = item.name.toLowerCase();
              const matchedKey = Object.keys(ASSET_IMAGE_MAP).find((key) => lowerName.includes(key));
              const hasHeat = itemHasHeatOption(item.name);
              return {
                ...item,
                image: matchedKey ? ASSET_IMAGE_MAP[matchedKey] : (item.image || hotChickImg),
                isSpicy: hasHeat,
              };
            });
          }
          setRestaurant(fetchedData);
          setLoading(false);
        })
        .catch((err) => {
          if (!isMounted) return;
          console.warn('API load fallback to Demo Seed Data:', err);
          setRestaurant(DEMO_RESTAURANT);
          setLoading(false);
        });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const categories = useMemo(() => {
    if (!restaurant || !restaurant.menuItems) return ['ALL'];
    const cats = new Set(
        restaurant.menuItems.map((item) => item.categoryName || item.category?.name || 'Menu'),
    );
    return ['ALL', ...Array.from(cats)];
  }, [restaurant]);

  const filteredItems = useMemo(() => {
    if (!restaurant || !restaurant.menuItems) return [];
    if (selectedCategory === 'ALL') return restaurant.menuItems;
    return restaurant.menuItems.filter((item) => {
      const cat = item.categoryName || item.category?.name || 'Menu';
      return cat === selectedCategory;
    });
  }, [restaurant, selectedCategory]);

  const handleOpenCustomizer = (item: MenuItem) => {
    setActiveItemModal(item);
    setSelectedHeat(HEAT_LEVELS[2]);
    setSelectedDrink('Coke');
    setSelectedDrinkSize('medium');
    setSelectedCheese('American');
    setItemQuantity(1);
    setSpecialInstructions('');
  };

  const calculatedUnitPrice = useMemo(() => {
    if (!activeItemModal) return 0;
    if (itemIsFountainDrink(activeItemModal.name)) {
      return selectedDrinkSize === 'large' ? 3.00 : 2.50;
    }
    return activeItemModal.price;
  }, [activeItemModal, selectedDrinkSize]);

  const handleAddToCart = () => {
    if (!activeItemModal) return;
    const hasHeat = itemHasHeatOption(activeItemModal.name);
    const isDrink = itemIsFountainDrink(activeItemModal.name);
    const isCheeseItem = itemIsCheese(activeItemModal.name);

    let displayName = activeItemModal.name;
    if (isDrink) {
      const sizeObj = DRINK_SIZES.find((s) => s.id === selectedDrinkSize);
      const sizeLabel = sizeObj ? sizeObj.label : 'Medium';
      displayName = `${activeItemModal.name} (${sizeLabel} - ${selectedDrink})`;
    } else if (isCheeseItem) {
      displayName = `${activeItemModal.name} (${selectedCheese})`;
    }

    const cartItem: CartItem = {
      cartId: `${activeItemModal.id}-${isDrink ? `${selectedDrinkSize}-${selectedDrink}` : isCheeseItem ? selectedCheese : (hasHeat ? selectedHeat.id : 'standard')}-${Date.now()}`,
      id: activeItemModal.id,
      name: displayName,
      price: calculatedUnitPrice,
      heat: hasHeat ? selectedHeat : null,
      quantity: itemQuantity,
      instructions: specialInstructions,
      image: activeItemModal.image,
    };
    setCart((prev) => [...prev, cartItem]);
    setActiveItemModal(null);
    setIsCartOpen(true);
  };

  const handleAddQuickUpsell = (upsell: UpsellItem) => {
    if (itemIsFountainDrink(upsell.name) || itemIsCheese(upsell.name)) {
      handleOpenCustomizer({
        id: upsell.id,
        name: upsell.name,
        categoryName: 'Extras',
        price: upsell.price,
        description: upsell.desc,
        image: upsell.image,
      });
      return;
    }

    setCart((prev) => [
      ...prev,
      {
        cartId: `upsell-${upsell.id}-${Date.now()}`,
        id: upsell.id,
        name: upsell.name,
        price: upsell.price,
        heat: null,
        quantity: 1,
        instructions: '',
        image: upsell.image,
      },
    ]);
  };

  const updateCartQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
        prev
            .map((item) => {
              if (item.cartId === cartId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter((item): item is CartItem => item !== null),
    );
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // --- SUBMITTING ONLINE ORDER & STRIPE PAYMENT INTENT ---
  const handleCheckoutSubmit = async () => {
    if (cart.length === 0) return;

    setSubmittingOrder(true);
    const storeData = restaurant || DEMO_RESTAURANT;
    const restaurantId = storeData.id || 1;

    const orderPayload = {
      orderType: 'ONLINE_PICKUP',
      paymentMethod: 'STRIPE',
      items: cart.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await axios.post(
          `http://localhost:8080/api/v1/customer/orders/online-checkout?restaurantId=${restaurantId}`,
          orderPayload,
          { withCredentials: true }
      );

      const { orderId: resOrderId, clientSecret: resClientSecret } = response.data;

      // Save Stripe credentials to state to render the Card Payment Form
      setOrderId(resOrderId);
      setClientSecret(resClientSecret);
      setIsCartOpen(false);
    } catch (err: unknown) {
      console.error('Checkout submission error:', err);
      let errorMsg = 'An unexpected error occurred.';

      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string; error?: string };
        errorMsg = data?.message || data?.error || err.message;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      alert(`Failed to place order: ${errorMsg}`);
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (loading) {
    return (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>PREPARING THE GRILL...</p>
        </div>
    );
  }

  if (error) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#dc2626', fontSize: '1.2rem' }}>{error}</div>;
  }

  const storeData = restaurant || DEMO_RESTAURANT;

  // --- RENDER STRIPE PAYMENT FORM WHEN CLIENT SECRET IS PRESENT ---
  if (clientSecret && orderId) {
    return (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
              clientSecret={clientSecret}
              orderId={orderId}
              onSuccess={() => {
                alert(`Order #${orderId} successfully placed and paid! See you at pickup!`);
                setCart([]);
                setClientSecret(null);
                setOrderId(null);
                setCurrentView('menu');
              }}
              onBack={() => {
                setClientSecret(null);
                setOrderId(null);
              }}
          />
        </Elements>
    );
  }

  return (
      <div style={styles.pageWrapper}>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bangers&display=swap" rel="stylesheet" />

        <div
            style={{
              ...styles.globalWatermarkLayer,
              backgroundImage: `url(${logoImg})`,
            }}
        />

        <header
            style={{
              ...styles.heroHeader,
              transform: `translateY(${scrollY * 0.4}px)`,
            }}
        >
          <div style={styles.heroOverlay1} />

          <div style={styles.heroContent}>
            <div style={styles.statusBadge}>
              <span style={styles.statusDot} /> OPEN NOW • ROWLETT, TX
            </div>

            <div style={styles.logoHeaderGroup}>
              <div style={styles.logoTextWrapper}>
                <h1 style={styles.storeTitle}>ROOSTER ROO</h1>
                <span style={styles.logoSubText}>HOT CHICKEN & SMASH BURGERS</span>
              </div>
            </div>

            <p style={styles.storeSubtitle}>🔥 Nashville Hot Tenders • Crispy Smash Burgers • Loaded Filthy Fries</p>
            <div style={styles.metaRow}>
              <span>📍 {storeData.address || '1234 Main St, Rowlett, TX'}</span>
              <span style={styles.metaDivider}>•</span>
              <span>📞 {storeData.phone || '(972) 555-0199'}</span>
            </div>
          </div>
        </header>

        {currentView === 'checkout' ? (
            <main style={styles.mainContent}>
              <div style={styles.checkoutContainer}>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1.5rem', color: '#0f172a' }}>
                  Review Your Order 🔥
                </h2>

                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
                  {cart.map((item) => (
                      <div key={item.cartId} style={styles.checkoutItemRow}>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '1.05rem' }}>{item.quantity}x {item.name}</div>
                          {item.heat && <div style={{ fontSize: '0.85rem', color: item.heat.color, marginTop: '2px' }}>{item.heat.icon} {item.heat.label}</div>}
                          {item.instructions && <div style={{ fontSize: '0.85rem', color: '#71717a', fontStyle: 'italic', marginTop: '2px' }}>"{item.instructions}"</div>}
                        </div>
                        <div style={{ fontWeight: 'bold', color: '#dc2626', fontSize: '1.1rem' }}>${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                  ))}
                </div>

                <div style={styles.checkoutSummaryBox}>
                  <div style={styles.summaryRow}><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
                  <div style={styles.summaryRow}><span>Estimated Tax (8.25%)</span><span>${(cartTotal * 0.0825).toFixed(2)}</span></div>
                  <div style={{ ...styles.summaryRow, fontWeight: 'bold', fontSize: '1.25rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '0.75rem' }}>
                    <span>Total</span>
                    <span style={{ color: '#dc2626' }}>${(cartTotal * 1.0825).toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button onClick={() => setCurrentView('menu')} style={styles.backBtn}>
                    ← Back to Menu
                  </button>
                  <button onClick={handleCheckoutSubmit} disabled={submittingOrder} style={styles.checkoutBtn}>
                    {submittingOrder ? 'Initializing Stripe...' : 'Proceed to Payment 🔥'}
                  </button>
                </div>
              </div>
            </main>
        ) : (
            <>
              <nav style={styles.stickyNav}>
                <div style={styles.navContainer}>
                  {categories.map((cat) => {
                    const count = cat === 'ALL'
                        ? storeData.menuItems.length
                        : storeData.menuItems.filter(i => (i.categoryName || i.category?.name) === cat).length;

                    return (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            style={{
                              ...styles.categoryTab,
                              ...(selectedCategory === cat ? styles.categoryTabActive : {}),
                            }}
                        >
                          <span>{cat === 'ALL' ? '🔥 All Flame Hits' : cat}</span>
                          <span style={{
                            marginLeft: '8px',
                            fontSize: '0.75rem',
                            padding: '2px 7px',
                            borderRadius: '999px',
                            backgroundColor: selectedCategory === cat ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)',
                            color: selectedCategory === cat ? '#fff' : '#52525b',
                            fontWeight: '700'
                          }}>
                      {count}
                    </span>
                        </button>
                    );
                  })}
                </div>
              </nav>

              <main style={styles.mainContent}>
                <div style={styles.menuHeader}>
                  <h2 style={styles.sectionTitle}>{selectedCategory === 'ALL' ? 'Full Menu' : selectedCategory}</h2>
                  <span style={styles.itemCount}>{filteredItems.length} Signature Items</span>
                </div>

                <div style={styles.grid}>
                  {filteredItems.map((item) => {
                    const lowerName = item.name.toLowerCase();
                    const matchedKey = Object.keys(ASSET_IMAGE_MAP).find((key) => lowerName.includes(key));
                    const itemImage = matchedKey ? ASSET_IMAGE_MAP[matchedKey] : (item.image || hotChickImg);
                    const hasHeat = itemHasHeatOption(item.name);

                    return (
                        <div key={item.id} style={styles.card} onClick={() => handleOpenCustomizer(item)}>
                          <div style={styles.cardImageWrapper}>
                            <img
                                src={itemImage}
                                alt={item.name}
                                style={styles.cardImage}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = hotChickImg;
                                }}
                            />
                            {hasHeat && <span style={styles.spicyBadge}>🔥 Customizable Heat</span>}
                          </div>
                          <div style={styles.cardBody}>
                            <h3 style={styles.itemTitle}>{item.name}</h3>
                            <p style={styles.itemDesc}>{item.description}</p>
                            <div style={styles.cardFooter}>
                              <span style={styles.priceTag}>${Number(item.price).toFixed(2)}</span>
                              <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenCustomizer(item);
                                  }}
                                  style={styles.addButton}
                              >
                                + Add to Order
                              </button>
                            </div>
                          </div>
                        </div>
                    );
                  })}
                </div>
              </main>
            </>
        )}

        {cartItemCount > 0 && !isCartOpen && currentView === 'menu' && (
            <div style={styles.floatingBar}>
              <div style={styles.floatingInfo}>
                <span style={styles.floatingCount}>{cartItemCount} {cartItemCount === 1 ? 'Item' : 'Items'}</span>
                <span style={styles.floatingTotal}>${cartTotal.toFixed(2)}</span>
              </div>
              <button onClick={() => setIsCartOpen(true)} style={styles.floatingButton}>
                View Cart & Checkout 🛒
              </button>
            </div>
        )}

        {/* CART DRAWER */}
        {isCartOpen && (
            <div style={styles.drawerOverlay} onClick={() => setIsCartOpen(false)}>
              <div style={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
                <div style={styles.drawerHeader}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>Your Order 🛒</h3>
                  <button onClick={() => setIsCartOpen(false)} style={styles.drawerClose}>✕</button>
                </div>

                <div style={styles.drawerBody}>
                  {cart.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#71717a', marginTop: '3rem' }}>Your cart is empty.</p>
                  ) : (
                      <>
                        {cart.map((item) => (
                            <div key={item.cartId} style={styles.drawerItem}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{item.name}</div>
                                {item.heat && <div style={{ fontSize: '0.8rem', color: item.heat.color }}>{item.heat.icon} {item.heat.label}</div>}
                                <div style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 'bold', marginTop: '4px' }}>${(item.price * item.quantity).toFixed(2)}</div>
                              </div>
                              <div style={styles.qtyControl}>
                                <button onClick={() => updateCartQuantity(item.cartId, -1)} style={styles.qtyBtn}>-</button>
                                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{item.quantity}</span>
                                <button onClick={() => updateCartQuantity(item.cartId, 1)} style={styles.qtyBtn}>+</button>
                              </div>
                            </div>
                        ))}

                        <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e4e4e7', paddingTop: '1rem' }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem' }}>🔥 Add Quick Flame Extras:</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {UPSELL_ITEMS.map((upsell) => (
                                <div key={upsell.id} style={styles.upsellRow}>
                                  <span style={{ fontSize: '0.85rem' }}>{upsell.name} (+${upsell.price.toFixed(2)})</span>
                                  <button onClick={() => handleAddQuickUpsell(upsell)} style={styles.upsellAddBtn}>+ Add</button>
                                </div>
                            ))}
                          </div>
                        </div>
                      </>
                  )}
                </div>

                {cart.length > 0 && (
                    <div style={styles.drawerFooter}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: '800', fontSize: '1.1rem' }}>
                        <span>Subtotal:</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <button
                          onClick={() => {
                            setIsCartOpen(false);
                            setCurrentView('checkout');
                          }}
                          style={styles.checkoutBtn}
                      >
                        Proceed to Checkout 🔥
                      </button>
                    </div>
                )}
              </div>
            </div>
        )}

        {/* CUSTOMIZATION MODAL */}
        {activeItemModal && (
            <div style={styles.modalOverlay} onClick={() => setActiveItemModal(null)}>
              <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button style={styles.modalClose} onClick={() => setActiveItemModal(null)}>✕</button>
                <h3 style={styles.modalTitle}>{activeItemModal.name}</h3>
                <p style={styles.modalSubtitle}>Customize your spice level and options</p>

                {itemIsCheese(activeItemModal.name) && (
                    <div style={styles.heatSection}>
                      <label style={styles.sectionLabel}>SELECT CHEESE TYPE:</label>
                      <div style={styles.heatGrid}>
                        {CHEESE_OPTIONS.map((cheese) => {
                          const isSelected = selectedCheese === cheese;
                          return (
                              <button
                                  key={cheese}
                                  onClick={() => setSelectedCheese(cheese)}
                                  style={{
                                    ...styles.heatPill,
                                    backgroundColor: isSelected ? '#dc2626' : '#f4f4f5',
                                    color: isSelected ? '#fff' : '#18181b',
                                    borderColor: isSelected ? '#dc2626' : '#e4e4e7',
                                  }}
                              >
                                {cheese}
                              </button>
                          );
                        })}
                      </div>
                    </div>
                )}

                {itemIsFountainDrink(activeItemModal.name) && (
                    <>
                      <div style={styles.heatSection}>
                        <label style={styles.sectionLabel}>SELECT FLAVOR:</label>
                        <select
                            value={selectedDrink}
                            onChange={(e) => setSelectedDrink(e.target.value)}
                            style={styles.drinkSelect}
                        >
                          {FOUNTAIN_DRINKS.map((drink) => (
                              <option key={drink} value={drink}>{drink}</option>
                          ))}
                        </select>
                      </div>

                      <div style={styles.heatSection}>
                        <label style={styles.sectionLabel}>SELECT SIZE:</label>
                        <div style={styles.heatGrid}>
                          {DRINK_SIZES.map((size) => {
                            const isSelected = selectedDrinkSize === size.id;
                            return (
                                <button
                                    key={size.id}
                                    onClick={() => setSelectedDrinkSize(size.id)}
                                    style={{
                                      ...styles.heatPill,
                                      backgroundColor: isSelected ? '#dc2626' : '#f4f4f5',
                                      color: isSelected ? '#fff' : '#18181b',
                                      borderColor: isSelected ? '#dc2626' : '#e4e4e7',
                                    }}
                                >
                                  {size.label} (+${size.price.toFixed(2)})
                                </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                )}

                {itemHasHeatOption(activeItemModal.name) && (
                    <div style={styles.heatSection}>
                      <label style={styles.sectionLabel}>SELECT HEAT LEVEL:</label>
                      <div style={styles.heatGrid}>
                        {HEAT_LEVELS.map((heat) => {
                          const isSelected = selectedHeat.id === heat.id;
                          return (
                              <button
                                  key={heat.id}
                                  onClick={() => setSelectedHeat(heat)}
                                  style={{
                                    ...styles.heatPill,
                                    backgroundColor: isSelected ? heat.color : '#f4f4f5',
                                    color: isSelected ? '#fff' : '#18181b',
                                    borderColor: isSelected ? heat.color : '#e4e4e7',
                                  }}
                              >
                                <span>{heat.icon}</span>
                                <span>{heat.label}</span>
                              </button>
                          );
                        })}
                      </div>
                    </div>
                )}

                <div style={styles.heatSection}>
                  <label style={styles.sectionLabel}>SPECIAL INSTRUCTIONS:</label>
                  <input
                      type="text"
                      placeholder="E.g., extra sauce on the side"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      style={styles.instructionInput}
                  />
                </div>

                <div style={styles.modalFooter}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))} style={styles.qtyBtn}>-</button>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{itemQuantity}</span>
                    <button onClick={() => setItemQuantity(itemQuantity + 1)} style={styles.qtyBtn}>+</button>
                  </div>
                  <button onClick={handleAddToCart} style={styles.addCartBtn}>
                    Add to Cart • ${(calculatedUnitPrice * itemQuantity).toFixed(2)}
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}

// --- STYLES ---
const styles: Record<string, React.CSSProperties> = {
  pageWrapper: {
    minHeight: '100vh',
    backgroundColor: '#fafaf9',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
    overflowX: 'hidden',
  },
  globalWatermarkLayer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: '450px',
    opacity: 0.03,
    pointerEvents: 'none',
    zIndex: 0,
  },
  heroHeader: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: '3rem 1.5rem',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
  heroOverlay1: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(circle at center, rgba(220, 38, 38, 0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 2,
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    color: '#34d399',
    padding: '6px 14px',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: '700',
    marginBottom: '1rem',
    border: '1px solid rgba(52, 211, 153, 0.3)',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#34d399',
    borderRadius: '50%',
    boxShadow: '0 0 8px #34d399',
  },
  logoHeaderGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '0.5rem',
  },
  logoTextWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  storeTitle: {
    fontFamily: '"Bangers", cursive, sans-serif',
    fontSize: '3.8rem',
    letterSpacing: '2px',
    margin: 0,
    color: '#ffffff',
    textShadow: '3px 3px 0px #dc2626',
  },
  logoSubText: {
    fontSize: '0.9rem',
    fontWeight: '800',
    letterSpacing: '3px',
    color: '#f87171',
    marginTop: '-6px',
  },
  storeSubtitle: {
    fontSize: '1.05rem',
    color: '#cbd5e1',
    marginBottom: '1rem',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.9rem',
    color: '#94a3b8',
  },
  metaDivider: {
    color: '#dc2626',
  },
  stickyNav: {
    position: 'sticky',
    top: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #e2e8f0',
    zIndex: 10,
    padding: '0.75rem 1rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
  },
  navContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  categoryTab: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    padding: '8px 16px',
    borderRadius: '999px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#475569',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  },
  categoryTabActive: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    borderColor: '#0f172a',
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem 6rem 1rem',
    position: 'relative',
    zIndex: 1,
  },
  menuHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '0.75rem',
  },
  sectionTitle: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  itemCount: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#64748b',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardImageWrapper: {
    position: 'relative',
    height: '180px',
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  spicyBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: '800',
    padding: '4px 8px',
    borderRadius: '6px',
  },
  cardBody: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  itemTitle: {
    fontSize: '1.15rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 0.5rem 0',
  },
  itemDesc: {
    fontSize: '0.85rem',
    color: '#64748b',
    lineHeight: '1.4',
    margin: '0 0 1rem 0',
    flex: 1,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  priceTag: {
    fontSize: '1.15rem',
    fontWeight: '800',
    color: '#dc2626',
  },
  addButton: {
    backgroundColor: '#0f172a',
    color: '#fff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  floatingBar: {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#0f172a',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '999px',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
    zIndex: 100,
  },
  floatingInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  floatingCount: {
    backgroundColor: '#dc2626',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: '800',
  },
  floatingTotal: {
    fontSize: '1.1rem',
    fontWeight: '800',
  },
  floatingButton: {
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '999px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  drawerOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 200,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  drawerContent: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#fff',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-5px 0 25px rgba(0,0,0,0.2)',
  },
  drawerHeader: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drawerClose: {
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    color: '#64748b',
  },
  drawerBody: {
    padding: '1.5rem',
    flex: 1,
    overflowY: 'auto',
  },
  drawerItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #f1f5f9',
  },
  qtyControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f1f5f9',
    padding: '4px 8px',
    borderRadius: '8px',
  },
  qtyBtn: {
    background: 'none',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0 4px',
  },
  upsellRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  upsellAddBtn: {
    backgroundColor: '#0f172a',
    color: '#fff',
    border: 'none',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  drawerFooter: {
    padding: '1.5rem',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  checkoutBtn: {
    width: '100%',
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: '12px',
    fontSize: '1.05rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 300,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '2rem',
    position: 'relative',
  },
  modalClose: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: '#f1f5f9',
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 4px 0',
  },
  modalSubtitle: {
    fontSize: '0.9rem',
    color: '#64748b',
    marginBottom: '1.5rem',
  },
  heatSection: {
    marginBottom: '1.5rem',
  },
  sectionLabel: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '800',
    color: '#475569',
    marginBottom: '0.75rem',
    letterSpacing: '0.5px',
  },
  heatGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
  },
  heatPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left',
  },
  drinkSelect: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    fontSize: '1rem',
    backgroundColor: '#fff',
  },
  instructionInput: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '2rem',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '1.5rem',
  },
  addCartBtn: {
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  checkoutContainer: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  checkoutItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #f1f5f9',
  },
  checkoutSummaryBox: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid #e2e8f0',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
    fontSize: '1rem',
    color: '#475569',
  },
  backBtn: {
    backgroundColor: '#e2e8f0',
    color: '#475569',
    border: 'none',
    padding: '14px 20px',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  paymentForm: {
    maxWidth: '500px',
    margin: '40px auto',
    padding: '2rem',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#0f172a',
    color: '#fff',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(255,255,255,0.1)',
    borderTop: '4px solid #dc2626',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem',
  },
  loadingText: {
    fontFamily: '"Bangers", cursive, sans-serif',
    fontSize: '1.5rem',
    letterSpacing: '2px',
    color: '#fff',
  },
};