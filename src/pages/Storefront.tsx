import { useEffect, useState, useMemo } from 'react';
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

// Initialize Stripe Publishable Key
const stripePromise = loadStripe('pk_test_51US07DDrPbKYidcS3ye8hScAVmfG9X93Ntv980ivRm98nFdfPdRQ9wuviog75xkcB9WN5BzB8x6UKVzndt7gZw8T0081NEjPd3');

// --- STRIPE PAYMENT FORM COMPONENT ---
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
      <div style={styles.stripePageWrapper}>
        <form onSubmit={handleSubmit} style={styles.stripeCardContainer}>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem', color: '#0f172a' }}>
            Secure Card Payment
          </h3>
          <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '1.5rem' }}>
            Processing Order #{orderId} via Stripe
          </p>

          <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569', fontWeight: '700' }}>
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
                  padding: '0.8rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem', padding: '1rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', backgroundColor: '#ffffff', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569', fontWeight: '700' }}>
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

          {errorMessage && <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '1rem' }}>{errorMessage}</p>}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onBack} style={styles.backBtn}>
              ← Back
            </button>
            <button type="submit" disabled={!stripe || loading} style={styles.checkoutBtn}>
              {loading ? 'Processing Payment...' : 'Pay Now 🔥'}
            </button>
          </div>
        </form>
      </div>
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
      categoryName: 'Combos & Chicken',
      price: 15.0,
      description: '2 Sandwiches w/ slaw, pickles, and RR sauce and a side of fries',
      image: heavenAndLoveImg,
      isSpicy: true,
    },
    {
      id: 102,
      name: '#2 Hot Motha Clucka',
      categoryName: 'Combos & Chicken',
      price: 13.0,
      description: '1 Sandwich and 1 jumbo tender w/ sliced bread, slaw, pickles, and RR sauce and a side of fries',
      image: hotMothaCluckaImg,
      isSpicy: true,
    },
    {
      id: 103,
      name: '#3 Shut The Cluck Up',
      categoryName: 'Combos & Chicken',
      price: 12.0,
      description: '3 Tenders w/ sliced bread, pickles, and RR sauce and a side of fries',
      image: shutTheCluckUpImg,
      isSpicy: true,
    },
    {
      id: 104,
      name: '#4 Red Chick',
      categoryName: 'Combos & Chicken',
      price: 11.0,
      description: '1 Sandwich w/ slaw, pickles, and RR sauce and a side of fries',
      image: redChickImg,
      isSpicy: true,
    },
    {
      id: 105,
      name: '#5 Hot Chick',
      categoryName: 'Combos & Chicken',
      price: 13.0,
      description: 'Bed of seasoned fries, chopped tenders, cheese, slaw, pickles, and RR sauce',
      image: hotChickImg,
      isSpicy: true,
    },
    {
      id: 106,
      name: '#6 Cluck and Blaze',
      categoryName: 'Combos & Chicken',
      price: 15.0,
      description: '1 Sandwich & Med #5 (Seasoned fries, chopped tenders, cheese, slaw, and RR sauce)',
      image: cluckAndBlazeImg,
      isSpicy: true,
    },
    {
      id: 107,
      name: '#7 Hot Chick 2.0 Buffalo Ranch',
      categoryName: 'Combos & Chicken',
      price: 13.0,
      description: 'Bed of seasoned fries, chopped tenders, cheese, slaw, pickles, and RR Buffalo sauce',
      image: hotChick20BuffaloRanchImg,
      isSpicy: true,
    },
    {
      id: 108,
      name: '#8 Love Bird',
      categoryName: 'Combos & Chicken',
      price: 11.0,
      description: '1 No Heat sandwich w/ lettuce, red onions, pickles, pickled jalapeños, and raw jalapeños and a side of fries',
      image: loveBirdImg,
      isSpicy: false,
    },
    {
      id: 109,
      name: '#9 Chicken & Belgian Pearl Sugar Waffles',
      categoryName: 'Combos & Chicken',
      price: 17.0,
      description: 'Two waffles topped with powdered sugar, served with two crispy tenders, fresh strawberries, and blueberries',
      image: chickenAndBelgianWafflesImg,
      isSpicy: false,
    },
    {
      id: 110,
      name: '#10 Son of a Bun',
      categoryName: 'Burgers',
      price: 12.5,
      description: 'Double smashed, 2 American cheeses, caramelized onions, pickles, and signature sauce',
      image: sonOfABunImg,
      isSpicy: false,
    },
    {
      id: 111,
      name: '#11 Holy Cow',
      categoryName: 'Burgers',
      price: 14.0,
      description: 'Double smashed, 2 American cheeses, bacon, grilled jalapeños, and spicy blaze sauce',
      image: holyCowImg,
      isSpicy: false,
    },
    {
      id: 112,
      name: '#12 Red Bull',
      categoryName: 'Burgers',
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

  // View & Checkout State
  const [currentView, setCurrentView] = useState<'menu' | 'checkout'>('menu');
  const [submittingOrder, setSubmittingOrder] = useState<boolean>(false);

  // Stripe Payment State
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);

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
      displayName = `${activeItemModal.name} - ${sizeLabel} (${selectedDrink})`;
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
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined
            }
          }
      );

      const { orderId: resOrderId, clientSecret: resClientSecret } = response.data;
      setOrderId(resOrderId);
      setClientSecret(resClientSecret);
      setIsCartOpen(false);
    } catch (err: unknown) {
      console.error('Checkout submission error details:', err);
      let serverMessage = 'An unexpected error occurred';

      if (axios.isAxiosError(err)) {
        serverMessage = err.response?.data?.message || err.response?.data?.error || err.message;
      } else if (err instanceof Error) {
        serverMessage = err.message;
      }

      alert(`Failed to place order: ${serverMessage}`);
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

  if (clientSecret && orderId) {
    return (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
              clientSecret={clientSecret}
              orderId={orderId}
              onSuccess={() => {
                alert(`Order #${orderId} successfully paid and placed! See you at pickup!`);
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

        {/* BRIGHT WATERMARK LAYER ACROSS BACKGROUND */}
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

        {activeItemModal && (
            <div style={styles.modalOverlay} onClick={() => setActiveItemModal(null)}>
              <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button style={styles.modalClose} onClick={() => setActiveItemModal(null)}>
                  ✕
                </button>
                <h3 style={styles.modalTitle}>{activeItemModal.name}</h3>
                <p style={styles.modalSubtitle}>Customize your options and quantity</p>

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
                                    borderColor: isSelected ? '#dc2626' : '#e4e4e7',
                                    backgroundColor: isSelected ? 'rgba(220,38,38,0.08)' : '#f4f4f5',
                                    boxShadow: isSelected ? '0 0 10px rgba(220,38,38,0.2)' : 'none',
                                  }}
                              >
                                <span style={{ fontSize: '1.1rem' }}>🧀</span>
                                <span style={{ ...styles.heatLabel, color: isSelected ? '#dc2626' : '#09090b', fontWeight: isSelected ? 'bold' : 'normal' }}>
                          {cheese}
                        </span>
                              </button>
                          );
                        })}
                      </div>
                    </div>
                )}

                {itemIsFountainDrink(activeItemModal.name) && (
                    <>
                      <div style={styles.heatSection}>
                        <label style={styles.sectionLabel}>CHOOSE SIZE:</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
                          {DRINK_SIZES.map((size) => {
                            const isSelected = selectedDrinkSize === size.id;
                            return (
                                <button
                                    key={size.id}
                                    onClick={() => setSelectedDrinkSize(size.id)}
                                    style={{
                                      ...styles.heatPill,
                                      justifyContent: 'center',
                                      borderColor: isSelected ? '#dc2626' : '#e4e4e7',
                                      backgroundColor: isSelected ? 'rgba(220,38,38,0.08)' : '#f4f4f5',
                                      boxShadow: isSelected ? '0 0 10px rgba(220,38,38,0.2)' : 'none',
                                    }}
                                >
                                  <span style={{ fontSize: '1rem', fontWeight: isSelected ? 'bold' : '600', color: isSelected ? '#dc2626' : '#09090b' }}>
                            {size.label} • ${size.price.toFixed(2)}
                          </span>
                                </button>
                            );
                          })}
                        </div>
                      </div>

                      <div style={styles.heatSection}>
                        <label style={styles.sectionLabel}>SELECT DRINK FLAVOR:</label>
                        <div style={styles.heatGrid}>
                          {FOUNTAIN_DRINKS.map((drink) => {
                            const isSelected = selectedDrink === drink;
                            return (
                                <button
                                    key={drink}
                                    onClick={() => setSelectedDrink(drink)}
                                    style={{
                                      ...styles.heatPill,
                                      borderColor: isSelected ? '#dc2626' : '#e4e4e7',
                                      backgroundColor: isSelected ? 'rgba(220,38,38,0.08)' : '#f4f4f5',
                                      boxShadow: isSelected ? '0 0 10px rgba(220,38,38,0.2)' : 'none',
                                    }}
                                >
                                  <span style={{ fontSize: '1.1rem' }}>🥤</span>
                                  <span style={{ ...styles.heatLabel, color: isSelected ? '#dc2626' : '#09090b', fontWeight: isSelected ? 'bold' : 'normal' }}>
                            {drink}
                          </span>
                                </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                )}

                {itemHasHeatOption(activeItemModal.name) && (
                    <div style={styles.heatSection}>
                      <label style={styles.sectionLabel}>CHOOSE SPICE LEVEL:</label>
                      <div style={styles.heatGrid}>
                        {HEAT_LEVELS.map((heat) => {
                          const isSelected = selectedHeat.id === heat.id;
                          return (
                              <button
                                  key={heat.id}
                                  onClick={() => setSelectedHeat(heat)}
                                  style={{
                                    ...styles.heatPill,
                                    borderColor: isSelected ? heat.color : '#e4e4e7',
                                    backgroundColor: isSelected ? `${heat.color}15` : '#f4f4f5',
                                    boxShadow: isSelected ? `0 0 12px ${heat.color}44` : 'none',
                                  }}
                              >
                                <span style={{ fontSize: '1.2rem' }}>{heat.icon}</span>
                                <span style={{ ...styles.heatLabel, color: isSelected ? '#09090b' : '#71717a' }}>
                          {heat.label}
                        </span>
                              </button>
                          );
                        })}
                      </div>
                      <div
                          style={{
                            ...styles.heatBanner,
                            backgroundColor: `${selectedHeat.color}15`,
                            borderColor: selectedHeat.color,
                          }}
                      >
                  <span style={{ color: selectedHeat.color, fontWeight: 'bold' }}>
                    {selectedHeat.icon} {selectedHeat.label}:
                  </span>{' '}
                        {selectedHeat.desc}
                      </div>
                    </div>
                )}

                <div style={styles.qtyRow}>
                  <span style={styles.sectionLabel}>QUANTITY:</span>
                  <div style={styles.qtyControls}>
                    <button onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))} style={styles.qtyBtn}>
                      -
                    </button>
                    <span style={styles.qtyVal}>{itemQuantity}</span>
                    <button onClick={() => setItemQuantity(itemQuantity + 1)} style={styles.qtyBtn}>
                      +
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem' }}>
                  <label style={styles.sectionLabel}>SPECIAL INSTRUCTIONS:</label>
                  <input
                      type="text"
                      placeholder="Extra pickles, sauce on side, etc."
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      style={styles.modalInput}
                  />
                </div>

                <button onClick={handleAddToCart} style={styles.modalAddBtn}>
                  Add to Order • ${(calculatedUnitPrice * itemQuantity).toFixed(2)}
                </button>
              </div>
            </div>
        )}

        {isCartOpen && (
            <div style={styles.modalOverlay} onClick={() => setIsCartOpen(false)}>
              <div style={styles.cartDrawer} onClick={(e) => e.stopPropagation()}>
                <div style={styles.cartHeader}>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#09090b' }}>Your Order</h3>
                  <button style={styles.modalClose} onClick={() => setIsCartOpen(false)}>
                    ✕
                  </button>
                </div>

                <div style={styles.cartBody}>
                  {cart.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#a1a1aa', padding: '3rem 0' }}>
                        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🛒</span>
                        Your cart is currently empty.
                      </div>
                  ) : (
                      <>
                        {cart.map((item) => (
                            <div key={item.cartId} style={styles.cartItemCard}>
                              {item.image && (
                                  <img
                                      src={item.image}
                                      alt={item.name}
                                      style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '8px', marginRight: '10px' }}
                                  />
                              )}
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 'bold', color: '#09090b' }}>{item.name}</div>
                                {item.heat && (
                                    <div style={{ fontSize: '0.85rem', color: item.heat.color, marginTop: '2px' }}>
                                      {item.heat.icon} {item.heat.label}
                                    </div>
                                )}
                                {item.instructions && (
                                    <div
                                        style={{
                                          fontSize: '0.8rem',
                                          color: '#71717a',
                                          fontStyle: 'italic',
                                          marginTop: '2px',
                                        }}
                                    >
                                      "{item.instructions}"
                                    </div>
                                )}
                                <div style={{ fontWeight: 'bold', color: '#dc2626', marginTop: '4px' }}>
                                  ${(item.price * item.quantity).toFixed(2)}
                                </div>
                              </div>
                              <div style={styles.qtyControls}>
                                <button onClick={() => updateCartQuantity(item.cartId, -1)} style={styles.qtyBtn}>
                                  -
                                </button>
                                <span style={styles.qtyVal}>{item.quantity}</span>
                                <button onClick={() => updateCartQuantity(item.cartId, 1)} style={styles.qtyBtn}>
                                  +
                                </button>
                              </div>
                            </div>
                        ))}

                        <div style={styles.upsellSection}>
                          <h4 style={styles.upsellTitle}>🔥 PAIRS WELL WITH:</h4>
                          <div style={styles.upsellList}>
                            {UPSELL_ITEMS.map((upsell) => (
                                <div key={upsell.id} style={styles.upsellCard}>
                                  {upsell.image && (
                                      <img
                                          src={upsell.image}
                                          alt={upsell.name}
                                          style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', marginRight: '8px' }}
                                      />
                                  )}
                                  <div style={{ flex: 1 }}>
                                    <div style={{ color: '#09090b', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                      {upsell.name}
                                    </div>
                                    <div style={{ color: '#dc2626', fontSize: '0.8rem' }}>+${upsell.price.toFixed(2)}</div>
                                  </div>
                                  <button onClick={() => handleAddQuickUpsell(upsell)} style={styles.upsellAddBtn}>
                                    + Add
                                  </button>
                                </div>
                            ))}
                          </div>
                        </div>
                      </>
                  )}
                </div>

                {cart.length > 0 && (
                    <div style={styles.cartFooter}>
                      <div style={styles.summaryRow}>
                        <span>Subtotal</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <div style={styles.summaryRow}>
                        <span>Estimated Tax</span>
                        <span>${(cartTotal * 0.0825).toFixed(2)}</span>
                      </div>
                      <div
                          style={{
                            ...styles.summaryRow,
                            color: '#09090b',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            borderTop: '1px solid #e4e4e7',
                            paddingTop: '0.75rem',
                          }}
                      >
                        <span>Total</span>
                        <span style={{ color: '#dc2626' }}>${(cartTotal * 1.0825).toFixed(2)}</span>
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

        <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      </div>
  );
}

const styles = {
  loadingContainer: {
    backgroundColor: '#fafafa',
    color: '#09090b',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, system-ui, sans-serif',
  } as const,
  spinner: {
    width: '60px',
    height: '60px',
    border: '4px solid rgba(220, 38, 38, 0.2)',
    borderTopColor: '#dc2626',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  } as const,
  loadingText: {
    marginTop: '1.5rem',
    color: '#dc2626',
    fontWeight: 'bold',
    letterSpacing: '2px',
    fontSize: '1rem',
  } as const,
  pageWrapper: {
    backgroundColor: '#f8fafc',
    color: '#09090b',
    minHeight: '100vh',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    position: 'relative',
    paddingBottom: '5rem',
    overflowX: 'hidden',
    width: '100vw',
    marginLeft: 'calc(50% - 50vw)',
    marginRight: 'calc(50% - 50vw)',
  } as const,
  globalWatermarkLayer: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    opacity: 0.85,
    zIndex: 0,
    pointerEvents: 'none',
  } as const,
  heroHeader: {
    position: 'relative',
    minHeight: '340px',
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    padding: '4rem 2rem 3rem 2rem',
    width: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    zIndex: 2,
  } as const,
  heroOverlay1: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(248, 250, 252, 0.95) 0%, rgba(248, 250, 252, 0.75) 100%)',
    zIndex: 1,
  } as const,
  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '1100px',
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  } as const,
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.4)',
    color: '#059669',
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.4rem 1rem',
    borderRadius: '9999px',
    marginBottom: '1.2rem',
    backdropFilter: 'blur(8px)',
  } as const,
  statusDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
  } as const,
  logoHeaderGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.8rem',
  } as const,
  logoTextWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  } as const,
  storeTitle: {
    fontSize: 'clamp(3rem, 9vw, 4.8rem)',
    fontWeight: '400',
    fontFamily: "'Bangers', 'Impact', sans-serif",
    letterSpacing: '3px',
    color: '#dc2626',
    textShadow: `
      2px 2px 0px #ffffff,
      0 0 20px rgba(220, 38, 38, 0.25)
    `,
    margin: 0,
    lineHeight: '1.0',
    transform: 'rotate(-1.5deg)',
  } as const,
  logoSubText: {
    fontFamily: "'Bangers', sans-serif",
    color: '#18181b',
    fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
    fontWeight: '400',
    letterSpacing: '4px',
    marginTop: '0.3rem',
    textTransform: 'uppercase',
  } as const,
  storeSubtitle: {
    color: '#b91c1c',
    fontSize: 'clamp(0.95rem, 2.5vw, 1.2rem)',
    fontWeight: '800',
    margin: '0.4rem 0 0.8rem 0',
    letterSpacing: '0.5px',
  } as const,
  metaRow: {
    display: 'flex',
    gap: '0.5rem',
    color: '#52525b',
    fontSize: '0.9rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  } as const,
  metaDivider: {
    color: '#a1a1aa',
  } as const,
  stickyNav: {
    position: 'sticky',
    top: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
    zIndex: 20,
    padding: '0.75rem 1rem',
    width: '100%',
    boxSizing: 'border-box',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
  } as const,
  navContainer: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    gap: '0.75rem',
    overflowX: 'auto',
    scrollbarWidth: 'none',
  } as const,
  categoryTab: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    padding: '0.7rem 1.4rem',
    borderRadius: '9999px',
    fontWeight: '600',
    fontSize: '0.875rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.3s ease',
  } as const,
  categoryTabActive: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    borderColor: '#dc2626',
    boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)',
  } as const,
  mainContent: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '3rem 1.5rem',
    position: 'relative',
    zIndex: 2,
  } as const,
  menuHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '2rem',
  } as const,
  sectionTitle: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  } as const,
  itemCount: {
    color: '#64748b',
    fontSize: '0.9rem',
    fontWeight: '600',
  } as const,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.75rem',
  } as const,
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  } as const,
  cardImageWrapper: {
    position: 'relative',
    width: '100%',
    height: '200px',
    backgroundColor: '#f1f5f9',
  } as const,
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  } as const,
  spicyBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    color: '#ffffff',
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.3rem 0.7rem',
    borderRadius: '9999px',
    backdropFilter: 'blur(4px)',
  } as const,
  cardBody: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'space-between',
  } as const,
  itemTitle: {
    fontSize: '1.15rem',
    fontWeight: 'bold',
    color: '#0f172a',
    margin: '0 0 0.5rem 0',
  } as const,
  itemDesc: {
    fontSize: '0.875rem',
    color: '#475569',
    lineHeight: '1.4',
    margin: '0 0 1.25rem 0',
  } as const,
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  } as const,
  priceTag: {
    fontSize: '1.15rem',
    fontWeight: '900',
    color: '#dc2626',
  } as const,
  addButton: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: 'none',
    padding: '0.6rem 1rem',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  } as const,
  floatingBar: {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    padding: '0.9rem 1.5rem',
    borderRadius: '9999px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    zIndex: 100,
    border: '1px solid #e2e8f0',
  } as const,
  floatingInfo: {
    display: 'flex',
    flexDirection: 'column',
  } as const,
  floatingCount: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '600',
  } as const,
  floatingTotal: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#dc2626',
  } as const,
  floatingButton: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    padding: '0.7rem 1.25rem',
    borderRadius: '9999px',
    fontWeight: '700',
    fontSize: '0.9rem',
    cursor: 'pointer',
  } as const,
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  } as const,
  modalContent: {
    backgroundColor: '#ffffff',
    color: '#0f172a',
    width: '100%',
    maxWidth: '480px',
    borderRadius: '20px',
    padding: '2rem',
    position: 'relative',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    maxHeight: '90vh',
    overflowY: 'auto',
  } as const,
  cartDrawer: {
    backgroundColor: '#ffffff',
    color: '#0f172a',
    width: '100%',
    maxWidth: '420px',
    height: '100%',
    maxHeight: '100vh',
    position: 'absolute',
    right: 0,
    top: 0,
    boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
  } as const,
  cartHeader: {
    padding: '1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as const,
  cartBody: {
    padding: '1.5rem',
    flex: 1,
    overflowY: 'auto',
  } as const,
  cartItemCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '1rem',
    marginBottom: '1rem',
    borderBottom: '1px solid #f1f5f9',
  } as const,
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    color: '#64748b',
  } as const,
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: '0 0 0.25rem 0',
  } as const,
  modalSubtitle: {
    fontSize: '0.875rem',
    color: '#64748b',
    margin: '0 0 1.5rem 0',
  } as const,
  heatSection: {
    marginBottom: '1.5rem',
  } as const,
  sectionLabel: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '800',
    letterSpacing: '1px',
    color: '#64748b',
    marginBottom: '0.75rem',
  } as const,
  heatGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem',
    marginBottom: '1rem',
  } as const,
  heatPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 0.8rem',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  } as const,
  heatLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
  } as const,
  heatBanner: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '0.85rem',
  } as const,
  qtyRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1.25rem',
  } as const,
  qtyControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: '#f1f5f9',
    padding: '0.3rem 0.6rem',
    borderRadius: '8px',
  } as const,
  qtyBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    color: '#0f172a',
  } as const,
  qtyVal: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
    minWidth: '20px',
    textAlign: 'center',
  } as const,
  modalInput: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
  } as const,
  modalAddBtn: {
    width: '100%',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    padding: '0.9rem',
    borderRadius: '10px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '1.5rem',
  } as const,
  upsellSection: {
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #e2e8f0',
  } as const,
  upsellTitle: {
    fontSize: '0.85rem',
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: '0.5px',
    marginBottom: '1rem',
  } as const,
  upsellList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  } as const,
  upsellCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    border: '1px solid #f1f5f9',
  } as const,
  upsellAddBtn: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: 'none',
    padding: '0.4rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  } as const,
  cartFooter: {
    padding: '1.5rem',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  } as const,
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    color: '#475569',
    marginBottom: '0.5rem',
  } as const,
  checkoutBtn: {
    width: '100%',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    padding: '1rem',
    borderRadius: '12px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '1rem',
    boxShadow: '0 4px 15px rgba(220, 38, 38, 0.25)',
  } as const,
  checkoutContainer: {
    maxWidth: '700px',
    margin: '0 auto',
    backgroundColor: '#f8fafc',
    padding: '1rem 0',
  } as const,
  checkoutItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '1rem',
    marginBottom: '1rem',
    borderBottom: '1px solid #f1f5f9',
  } as const,
  checkoutSummaryBox: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
  } as const,
  backBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    border: '1px solid #cbd5e1',
    padding: '1rem',
    borderRadius: '12px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
  } as const,
  stripePageWrapper: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  } as const,
  stripeCardContainer: {
    maxWidth: '500px',
    width: '100%',
    padding: '2.5rem',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
    textAlign: 'center',
  } as const,
};