// src/pages/CartArea.tsx
import { useState } from "react";
import {
   clear_cart,
   remove_cart_product,
} from "../../../redux/features/cartSlice";

import { useDispatch, useSelector } from "react-redux";
import UseCartInfo from "../../../hooks/UseCartInfo";
import { RootState } from "../../../redux/store";
import { Link } from "react-router-dom";
import { apiFetch } from "../../../api";

const CartArea = () => {
   const productItem = useSelector((state: RootState) => state.cart.cart);
   const dispatch = useDispatch();
   const { total } = UseCartInfo();

   const [showGuestModal, setShowGuestModal] = useState(false);
   const [guestNameInput, setGuestNameInput] = useState("");
   const [guestEmailInput, setGuestEmailInput] = useState("");
   const [guestPhoneInput, setGuestPhoneInput] = useState("");
   // const [couponCode, setCouponCode] = useState("");



   /* -----------------------------
      Helper: detect logged-in user
      ----------------------------- */
   const isLoggedInUser = (() => {
      try {
         const user = JSON.parse(localStorage.getItem("user") || "null");
         return user && user.role !== "admin";
      } catch {
         return false;
      }
   })();

   /* -----------------------------
      Save guest details and continue
      ----------------------------- */
   const saveGuestDetails = () => {
      if (!guestNameInput.trim() || !guestEmailInput.trim() || !guestPhoneInput.trim()) {
         alert("Please enter name, email and phone");
         return;
      }
      registerAndProceed(guestNameInput.trim(), guestEmailInput.trim(), guestPhoneInput.trim());
   };

   const registerAndProceed = async (name: string, email: string, phone: string) => {
      try {
         const response = await apiFetch("/api/auth/register-guest", {
            method: "POST",
            body: JSON.stringify({ name, email, phone }),
         });

         if (response.success) {
            localStorage.setItem("guest_name", name);
            localStorage.setItem("guest_email", email);
            setShowGuestModal(false);
            startCartPayment(true);
         } else {
            alert(response.message || "Failed to register guest.");
         }
      } catch (error) {
         console.error("Guest registration error:", error);
         alert("An error occurred during guest registration.");
      }
   };

   /* -----------------------------
      Start payment (recomputes owner info fresh)
      skipModal = true when called immediately after saving guest data
      ----------------------------- */
   const startCartPayment = async (skipModal = false) => {
      // Always open modal for guest users (OPTION A)
      if (!isLoggedInUser && !skipModal) {
         setShowGuestModal(true);
         return;
      }

      // Recompute fresh owner values from storage (or logged-in user)
      let ownerName = "";
      let ownerEmail = "";

      if (isLoggedInUser) {
         try {
            const storedUser = JSON.parse(localStorage.getItem("user") || "null");
            ownerName = storedUser?.name || "";
            ownerEmail = storedUser?.email || "";
         } catch {
            ownerName = "";
            ownerEmail = "";
         }
      } else {
         ownerName = localStorage.getItem("guest_name") || "";
         ownerEmail = localStorage.getItem("guest_email") || "";
      }

      console.log("FRESH CART OWNER INFO:", { ownerName, ownerEmail });

      if (!ownerName.trim() || !ownerEmail.trim()) {
         alert("Missing name/email");
         return;
      }

      try {
         if (productItem.length === 0) {
            alert("Your cart is empty");
            return;
         }

         const amount = total;
         const course_ids = productItem.map((i: any) => i.id);

         // 1) Create Razorpay order
         const order = await apiFetch("/api/payment/order", {
            method: "POST",
            body: JSON.stringify({
               amount,
               course_ids,
               customer_name: ownerName,
               customer_email: ownerEmail,
            }),
         });

         if (!order?.id) {
            alert("Failed to create payment order");
            return;
         }

         // 2) Razorpay Checkout
         const options: any = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: "ProdemyX – Cart Checkout",
            description: "Purchase Multiple Courses",
            order_id: order.id,

            prefill: {
               name: ownerName,
               email: ownerEmail,
            },

            handler: async function (response: any) {
               try {
                  await apiFetch("/api/payment/verify", {
                     method: "POST",
                     body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,

                        course_ids: JSON.stringify(course_ids),
                        amount,
                        customer_name: ownerName,
                        customer_email: ownerEmail,
                     }),
                  });

                  dispatch(clear_cart());
                  window.location.href = "/payment-success";
               } catch (err) {
                  console.error(err);
                  window.location.href = "/payment-failed";
               }
            },
         };

         new (window as any).Razorpay(options).open();
      } catch (err) {
         console.error(err);
         alert("Unable to start payment");
      }
   };

   /* -----------------------------
      Coupon apply placeholder (no backend logic provided)
      ----------------------------- */
   // const applyCoupon = () => {
   //    // placeholder - implement coupon validation with backend
   //    if (!couponCode.trim()) {
   //       alert("Enter a coupon code");
   //       return;
   //    }
   //    alert(`Coupon "${couponCode}" applied (placeholder).`);
   // };

   /* -----------------------------
      UI (modal placed above cart; cart markup unchanged)
      ----------------------------- */
   return (
      <>
         {/* GUEST MODAL (styled to match your site) */}
         {showGuestModal && !isLoggedInUser && (
            <div
               style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.55)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 9999,
                  backdropFilter: "blur(3px)",
               }}
            >
               <div
                  role="dialog"
                  aria-modal="true"
                  style={{
                     width: "420px",
                     background: "#fff",
                     padding: "32px",
                     borderRadius: "20px",
                     boxShadow: "0px 8px 0px #000",
                     border: "2px solid #000",
                     textAlign: "center",
                  }}
                  onClick={(e) => e.stopPropagation()}
               >
                  <h2
                     style={{
                        fontSize: "22px",
                        fontWeight: 700,
                        marginBottom: "18px",
                        color: "#212121",
                     }}
                  >
                     Enter Your Details
                  </h2>

                  <input
                     type="text"
                     placeholder="Your Name"
                     value={guestNameInput}
                     onChange={(e) => setGuestNameInput(e.target.value)}
                     style={{
                        width: "100%",
                        padding: "14px 16px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "12px",
                        marginBottom: "12px",
                        fontSize: "15px",
                     }}
                  />

                  <input
                     type="email"
                     placeholder="Your Email"
                     value={guestEmailInput}
                     onChange={(e) => setGuestEmailInput(e.target.value)}
                     style={{
                        width: "100%",
                        padding: "14px 16px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "12px",
                        marginBottom: "12px",
                        fontSize: "15px",
                     }}
                  />

                  <input
                     type="tel"
                     placeholder="Your Phone"
                     value={guestPhoneInput}
                     onChange={(e) => setGuestPhoneInput(e.target.value)}
                     style={{
                        width: "100%",
                        padding: "14px 16px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "12px",
                        marginBottom: "20px",
                        fontSize: "15px",
                     }}
                  />

                  <button
                     onClick={saveGuestDetails}
                     style={{
                        width: "100%",
                        padding: "14px 0",
                        backgroundColor: "#F9C93A",
                        color: "#000",
                        borderRadius: "30px",
                        border: "2px solid #000",
                        boxShadow: "4px 4px 0 #000",
                        fontWeight: 600,
                        fontSize: "15px",
                        marginBottom: "12px",
                        cursor: "pointer",
                     }}
                  >
                     Continue To Checkout
                  </button>

                  <button
                     onClick={() => setShowGuestModal(false)}
                     style={{
                        width: "100%",
                        padding: "12px 0",
                        backgroundColor: "#fff",
                        color: "#000",
                        borderRadius: "30px",
                        border: "2px solid #000",
                        boxShadow: "4px 4px 0 #000",
                        fontWeight: 600,
                        fontSize: "15px",
                        cursor: "pointer",
                     }}
                  >
                     Cancel
                  </button>
               </div>
            </div>
         )}

         {/* CART PAGE */}
         <div className="cart__area section-py-120">
            <div className="container">
               {productItem.length === 0 ? (
                  <div className="mb-30">
                     <div className="empty_bag text-center">
                        <p className="py-3">Your Bag is Empty</p>
                        <Link to="/Categories">
                           <button className="btn">Go To Courses</button>
                        </Link>
                     </div>
                  </div>
               ) : (
                  <div className="row">
                     {/* LEFT CART TABLE */}
                     <div className="col-lg-8">
                        <table className="table cart__table">
                           <thead>
                              <tr>
                                 <th className="product__thumb">&nbsp;</th>
                                 <th className="product__name">Product</th>
                                 <th className="product__price">Price</th>
                                 {/* <th className="product__quantity">Quantity</th> */}
                                 <th className="product__subtotal">Subtotal</th>
                                 <th className="product__remove">&nbsp;</th>
                              </tr>
                           </thead>

                           <tbody>
                              {productItem.map((item: any, i: any) => (
                                 <tr key={i}>
                                    <td className="product__thumb">
                                       <Link to={`/shop-details/${item.id}`}>
                                          <img src={item.thumb} alt="cart" />
                                       </Link>
                                    </td>

                                    <td className="product__name">
                                       <Link to={`/shop-details/${item.id}`}>{item.title}</Link>
                                    </td>

                                    <td className="product__price">₹{item.price}.00</td>

                                    <td className="product__remove">
                                       <a
                                          style={{ cursor: "pointer" }}
                                          onClick={() => dispatch(remove_cart_product(item))}
                                       >
                                          ×
                                       </a>
                                    </td>
                                 </tr>
                              ))}

                              <tr>
                                 <td colSpan={6} className="cart__actions">

                                    {/* ONE ROW: input + apply + clear (aligned perfectly) */}
                                    <div
                                       style={{
                                          display: "flex",
                                          alignItems: "center",
                                          width: "100%",
                                          gap: "15px",
                                       }}
                                    >
                                       {/* COUPON INPUT LEFT */}
                                       {/* <input
                                          type="text"
                                          placeholder="Coupon code"
                                          value={couponCode}
                                          onChange={(e) => setCouponCode(e.target.value)}
                                          style={{
                                             width: "40%", // your custom width
                                             padding: "15px 20px",
                                             borderRadius: "40px",
                                             border: "1px solid #e6e6e6",
                                             background: "#f6f6f6",
                                             fontSize: "15px",
                                          }}
                                       />

                                       {/* APPLY COUPON MIDDLE */}
                                       {/* <button
                                          type="button"
                                          onClick={applyCoupon}
                                          style={{
                                             background: "#6b46ff",
                                             color: "#fff",
                                             padding: "12px 26px",
                                             borderRadius: "40px",
                                             border: "none",
                                             boxShadow: "4px 4px 0 #2b1b6b",
                                             cursor: "pointer",
                                             fontWeight: 600,
                                             whiteSpace: "nowrap",
                                          }}
                                       >
                                          Apply Coupon
                                       </button> */} 

                                       {/* CLEAR CART RIGHT (aligned horizontally) */}
                                       <button
                                          type="button"
                                          onClick={() => dispatch(clear_cart())}
                                          style={{
                                             background: "#6b46ff",
                                             color: "#fff",
                                             padding: "12px 26px",
                                             borderRadius: "40px",
                                             border: "none",
                                             boxShadow: "4px 4px 0 #2b1b6b",
                                             cursor: "pointer",
                                             fontWeight: 600,
                                             whiteSpace: "nowrap",
                                             marginLeft: "auto",   // <-- KEY FIX
                                          }}
                                       >
                                          Clear Cart
                                       </button>
                                    </div>

                                 </td>
                              </tr>



                           </tbody>
                        </table>
                     </div>

                     {/* RIGHT TOTAL */}
                     <div className="col-lg-4">
                        <div className="cart__collaterals-wrap">
                           <h2 className="title">Cart Totals</h2>

                           <ul className="list-wrap">
                              <li>
                                 Subtotal <span>₹{total.toFixed(2)}</span>
                              </li>
                              <li>
                                 Total <span className="amount">₹{total.toFixed(2)}</span>
                              </li>
                           </ul>

                           <button type="button" onClick={() => startCartPayment()} className="btn">
                              Proceed To Checkout
                           </button>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </>
   );
};

export default CartArea;
