import {
  require_react
} from "./chunk-O63ZJDQY.js";
import {
  __commonJS
} from "./chunk-HFZ37CMS.js";

// node_modules/react/cjs/react-jsx-runtime.development.js
var require_react_jsx_runtime_development = __commonJS({
  "node_modules/react/cjs/react-jsx-runtime.development.js"(exports) {
    "use strict";
    (function() {
      function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type)
          return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return "Fragment";
          case REACT_PROFILER_TYPE:
            return "Profiler";
          case REACT_STRICT_MODE_TYPE:
            return "StrictMode";
          case REACT_SUSPENSE_TYPE:
            return "Suspense";
          case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
          case REACT_ACTIVITY_TYPE:
            return "Activity";
        }
        if ("object" === typeof type)
          switch ("number" === typeof type.tag && console.error(
            "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
          ), type.$$typeof) {
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_CONTEXT_TYPE:
              return (type.displayName || "Context") + ".Provider";
            case REACT_CONSUMER_TYPE:
              return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
              var innerType = type.render;
              type = type.displayName;
              type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
              return type;
            case REACT_MEMO_TYPE:
              return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
              innerType = type._payload;
              type = type._init;
              try {
                return getComponentNameFromType(type(innerType));
              } catch (x) {
              }
          }
        return null;
      }
      function testStringCoercion(value) {
        return "" + value;
      }
      function checkKeyStringCoercion(value) {
        try {
          testStringCoercion(value);
          var JSCompiler_inline_result = false;
        } catch (e) {
          JSCompiler_inline_result = true;
        }
        if (JSCompiler_inline_result) {
          JSCompiler_inline_result = console;
          var JSCompiler_temp_const = JSCompiler_inline_result.error;
          var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
          JSCompiler_temp_const.call(
            JSCompiler_inline_result,
            "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
            JSCompiler_inline_result$jscomp$0
          );
          return testStringCoercion(value);
        }
      }
      function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE)
          return "<...>";
        try {
          var name = getComponentNameFromType(type);
          return name ? "<" + name + ">" : "<...>";
        } catch (x) {
          return "<...>";
        }
      }
      function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
      }
      function UnknownOwner() {
        return Error("react-stack-top-frame");
      }
      function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
          var getter = Object.getOwnPropertyDescriptor(config, "key").get;
          if (getter && getter.isReactWarning) return false;
        }
        return void 0 !== config.key;
      }
      function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
          specialPropKeyWarningShown || (specialPropKeyWarningShown = true, console.error(
            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
            displayName
          ));
        }
        warnAboutAccessingKey.isReactWarning = true;
        Object.defineProperty(props, "key", {
          get: warnAboutAccessingKey,
          configurable: true
        });
      }
      function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = true, console.error(
          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
        ));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
      }
      function ReactElement(type, key, self, source, owner, props, debugStack, debugTask) {
        self = props.ref;
        type = {
          $$typeof: REACT_ELEMENT_TYPE,
          type,
          key,
          props,
          _owner: owner
        };
        null !== (void 0 !== self ? self : null) ? Object.defineProperty(type, "ref", {
          enumerable: false,
          get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", { enumerable: false, value: null });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        });
        Object.defineProperty(type, "_debugStack", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
      }
      function jsxDEVImpl(type, config, maybeKey, isStaticChildren, source, self, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children)
          if (isStaticChildren)
            if (isArrayImpl(children)) {
              for (isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)
                validateChildKeys(children[isStaticChildren]);
              Object.freeze && Object.freeze(children);
            } else
              console.error(
                "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
              );
          else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
          children = getComponentNameFromType(type);
          var keys = Object.keys(config).filter(function(k) {
            return "key" !== k;
          });
          isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
          didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error(
            'A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />',
            isStaticChildren,
            children,
            keys,
            children
          ), didWarnAboutKeySpread[children + isStaticChildren] = true);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
          maybeKey = {};
          for (var propName in config)
            "key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(
          maybeKey,
          "function" === typeof type ? type.displayName || type.name || "Unknown" : type
        );
        return ReactElement(
          type,
          children,
          self,
          source,
          getOwner(),
          maybeKey,
          debugStack,
          debugTask
        );
      }
      function validateChildKeys(node) {
        "object" === typeof node && null !== node && node.$$typeof === REACT_ELEMENT_TYPE && node._store && (node._store.validated = 1);
      }
      var React = require_react(), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler");
      Symbol.for("react.provider");
      var REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
      };
      React = {
        react_stack_bottom_frame: function(callStackForError) {
          return callStackForError();
        }
      };
      var specialPropKeyWarningShown;
      var didWarnAboutElementRef = {};
      var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(
        React,
        UnknownOwner
      )();
      var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
      var didWarnAboutKeySpread = {};
      exports.Fragment = REACT_FRAGMENT_TYPE;
      exports.jsx = function(type, config, maybeKey, source, self) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        return jsxDEVImpl(
          type,
          config,
          maybeKey,
          false,
          source,
          self,
          trackActualOwner ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
          trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
        );
      };
      exports.jsxs = function(type, config, maybeKey, source, self) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        return jsxDEVImpl(
          type,
          config,
          maybeKey,
          true,
          source,
          self,
          trackActualOwner ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
          trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask
        );
      };
    })();
  }
});

// node_modules/react/jsx-runtime.js
var require_jsx_runtime = __commonJS({
  "node_modules/react/jsx-runtime.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_react_jsx_runtime_development();
    }
  }
});

// node_modules/react-simple-star-rating/dist/index.js
var require_dist = __commonJS({
  "node_modules/react-simple-star-rating/dist/index.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var e = require_jsx_runtime();
    var t = require_react();
    var o = function() {
      return o = Object.assign || function(e2) {
        for (var t2, o2 = 1, n2 = arguments.length; o2 < n2; o2++) for (var i2 in t2 = arguments[o2]) Object.prototype.hasOwnProperty.call(t2, i2) && (e2[i2] = t2[i2]);
        return e2;
      }, o.apply(this, arguments);
    };
    function n(e2, t2, o2) {
      if (o2 || 2 === arguments.length) for (var n2, i2 = 0, r2 = t2.length; i2 < r2; i2++) !n2 && i2 in t2 || (n2 || (n2 = Array.prototype.slice.call(t2, 0, i2)), n2[i2] = t2[i2]);
      return e2.concat(n2 || Array.prototype.slice.call(t2));
    }
    function i(t2) {
      var n2 = t2.size, i2 = void 0 === n2 ? 25 : n2, r2 = t2.SVGstrokeColor, l2 = void 0 === r2 ? "currentColor" : r2, a2 = t2.SVGstorkeWidth, s2 = void 0 === a2 ? 0 : a2, c2 = t2.SVGclassName, d2 = void 0 === c2 ? "star-svg" : c2, u2 = t2.SVGstyle;
      return e.jsx("svg", o({ className: d2, style: u2, stroke: l2, fill: "currentColor", strokeWidth: s2, viewBox: "0 0 24 24", width: i2, height: i2, xmlns: "http://www.w3.org/2000/svg" }, { children: e.jsx("path", { d: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" }) }));
    }
    function r(e2, t2) {
      switch (t2.type) {
        case "PointerMove":
          return o(o({}, e2), { hoverValue: t2.payload, hoverIndex: t2.index });
        case "PointerLeave":
          return o(o({}, e2), { ratingValue: e2.ratingValue, hoverIndex: 0, hoverValue: null });
        case "MouseClick":
          return o(o({}, e2), { valueIndex: e2.hoverIndex, ratingValue: t2.payload });
        default:
          return e2;
      }
    }
    var l = "style-module_starRatingWrap__q-lJC";
    var a = "style-module_simpleStarRating__nWUxf";
    var s = "style-module_fillIcons__6---A";
    var c = "style-module_emptyIcons__Bg-FZ";
    var d = "style-module_tooltip__tKc3i";
    function u() {
      return "undefined" != typeof window && window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window || "undefined" != typeof navigator && navigator.maxTouchPoints > 0;
    }
    !function(e2, t2) {
      void 0 === t2 && (t2 = {});
      var o2 = t2.insertAt;
      if (e2 && "undefined" != typeof document) {
        var n2 = document.head || document.getElementsByTagName("head")[0], i2 = document.createElement("style");
        i2.type = "text/css", "top" === o2 && n2.firstChild ? n2.insertBefore(i2, n2.firstChild) : n2.appendChild(i2), i2.styleSheet ? i2.styleSheet.cssText = e2 : i2.appendChild(document.createTextNode(e2));
      }
    }(".style-module_starRatingWrap__q-lJC{display:inline-block;touch-action:none}.style-module_simpleStarRating__nWUxf{display:inline-block;overflow:hidden;position:relative;touch-action:none;-webkit-user-select:none;-moz-user-select:none;user-select:none;vertical-align:middle;white-space:nowrap}.style-module_fillIcons__6---A{display:inline-block;overflow:hidden;position:absolute;top:0;white-space:nowrap}.style-module_emptyIcons__Bg-FZ{display:inline-block}.style-module_tooltip__tKc3i{background-color:#333;border-radius:5px;color:#fff;display:inline-block;padding:5px 15px;vertical-align:middle}"), exports.Rating = function(v) {
      var p, f, h = v.onClick, y = v.onPointerMove, m = v.onPointerEnter, g = v.onPointerLeave, x = v.initialValue, _ = void 0 === x ? 0 : x, C = v.iconsCount, w = void 0 === C ? 5 : C, V = v.size, k = void 0 === V ? 40 : V, S = v.readonly, b = void 0 !== S && S, M = v.rtl, G = void 0 !== M && M, I = v.customIcons, N = void 0 === I ? [] : I, j = v.allowFraction, P = void 0 !== j && j, A = v.style, L = v.className, R = void 0 === L ? "react-simple-star-rating" : L, T = v.transition, W = void 0 !== T && T, z = v.allowHover, B = void 0 === z || z, E = v.disableFillHover, F = void 0 !== E && E, q = v.fillIcon, O = void 0 === q ? null : q, H = v.fillColor, J = void 0 === H ? "#ffbc0b" : H, K = v.fillColorArray, U = void 0 === K ? [] : K, Z = v.fillStyle, D = v.fillClassName, X = void 0 === D ? "filled-icons" : D, Y = v.emptyIcon, Q = void 0 === Y ? null : Y, $ = v.emptyColor, ee = void 0 === $ ? "#cccccc" : $, te = v.emptyStyle, oe = v.emptyClassName, ne = void 0 === oe ? "empty-icons" : oe, ie = v.allowTitleTag, re = void 0 === ie || ie, le = v.showTooltip, ae = void 0 !== le && le, se = v.tooltipDefaultText, ce = void 0 === se ? "Your Rate" : se, de = v.tooltipArray, ue = void 0 === de ? [] : de, ve = v.tooltipStyle, pe = v.tooltipClassName, fe = void 0 === pe ? "react-simple-star-rating-tooltip" : pe, he = v.SVGclassName, ye = void 0 === he ? "star-svg" : he, me = v.titleSeparator, ge = void 0 === me ? "out of" : me, xe = v.SVGstyle, _e = v.SVGstorkeWidth, Ce = void 0 === _e ? 0 : _e, we = v.SVGstrokeColor, Ve = void 0 === we ? "currentColor" : we, ke = t.useReducer(r, { hoverIndex: 0, valueIndex: 0, ratingValue: _, hoverValue: null }), Se = ke[0], be = Se.ratingValue, Me = Se.hoverValue, Ge = Se.hoverIndex, Ie = Se.valueIndex, Ne = ke[1];
      t.useEffect(function() {
        _ && Ne({ type: "MouseClick", payload: 0 });
      }, [_]);
      var je = t.useMemo(function() {
        return P ? 2 * w : w;
      }, [P, w]), Pe = t.useMemo(function() {
        return _ > je ? 0 : P || Math.floor(_) === _ ? Math.round(_ / w * 100) : 2 * Math.ceil(_) * 10;
      }, [P, _, w, je]), Ae = t.useMemo(function() {
        return (P ? 2 * _ - 1 : _ - 1) || 0;
      }, [P, _]), Le = t.useCallback(function(e2) {
        return w % 2 != 0 ? e2 / 2 / 10 : e2 * w / 100;
      }, [w]), Re = function(e2) {
        for (var t2 = e2.clientX, o2 = e2.currentTarget.children[0].getBoundingClientRect(), n2 = o2.left, i2 = o2.right, r2 = o2.width, l2 = G ? i2 - t2 : t2 - n2, a2 = je, s2 = Math.round(r2 / je), c2 = 0; c2 <= je; c2 += 1) if (l2 <= s2 * c2) {
          a2 = 0 === c2 && l2 < s2 ? 0 : c2;
          break;
        }
        var d2 = a2 - 1;
        a2 > 0 && (Ne({ type: "PointerMove", payload: 100 * a2 / je, index: d2 }), y && Me && y(Le(Me), d2, e2));
      }, Te = function(e2) {
        Me && (Ne({ type: "MouseClick", payload: Me }), h && h(Le(Me), Ge, e2));
      }, We = t.useMemo(function() {
        if (B) {
          if (F) {
            var e2 = be && be || Pe;
            return Me && Me > e2 ? Me : e2;
          }
          return Me && Me || be && be || Pe;
        }
        return be && be || Pe;
      }, [B, F, Me, be, Pe]);
      t.useEffect(function() {
        ue.length > je && console.error("tooltipArray Array length is bigger then Icons Count length.");
      }, [ue.length, je]);
      var ze = t.useCallback(function(e2) {
        return Me && e2[Ge] || be && e2[Ie] || _ && e2[Ae];
      }, [Me, Ge, be, Ie, _, Ae]), Be = t.useMemo(function() {
        return Me && Le(Me) || be && Le(be) || _ && Le(Pe);
      }, [Me, Le, be, _, Pe]);
      return e.jsxs("span", o({ className: l, style: { direction: "".concat(G ? "rtl" : "ltr") } }, { children: [e.jsxs("span", o({ className: "".concat(a, " ").concat(R), style: o({ cursor: b ? "" : "pointer" }, A), onPointerMove: b ? void 0 : Re, onPointerEnter: b ? void 0 : function(e2) {
        m && m(e2), u() && Re(e2);
      }, onPointerLeave: b ? void 0 : function(e2) {
        u() && Te(), Ne({ type: "PointerLeave" }), g && g(e2);
      }, onClick: b ? void 0 : Te, "aria-hidden": "true" }, { children: [e.jsx("span", o({ className: "".concat(c, " ").concat(ne), style: o({ color: ee }, te) }, { children: n([], Array(w), true).map(function(o2, n2) {
        var r2;
        return e.jsx(t.Fragment, { children: (null === (r2 = N[n2]) || void 0 === r2 ? void 0 : r2.icon) || Q || e.jsx(i, { SVGclassName: ye, SVGstyle: xe, SVGstorkeWidth: Ce, SVGstrokeColor: Ve, size: k }) }, n2);
      }) })), e.jsx("span", o({ className: "".concat(s, " ").concat(X), style: o((p = {}, p[G ? "right" : "left"] = 0, p.color = ze(U) || J, p.transition = W ? "width .2s ease, color .2s ease" : "", p.width = "".concat(We, "%"), p), Z), title: re ? "".concat(Be, " ").concat(ge, " ").concat(w) : void 0 }, { children: n([], Array(w), true).map(function(o2, n2) {
        var r2;
        return e.jsx(t.Fragment, { children: (null === (r2 = N[n2]) || void 0 === r2 ? void 0 : r2.icon) || O || e.jsx(i, { SVGclassName: ye, SVGstyle: xe, SVGstorkeWidth: Ce, SVGstrokeColor: Ve, size: k }) }, n2);
      }) }))] })), ae && e.jsx("span", o({ className: "".concat(d, " ").concat(fe), style: o((f = {}, f[G ? "marginRight" : "marginLeft"] = 20, f), ve) }, { children: (ue.length > 0 ? ze(ue) : Be) || ce }))] }));
    };
  }
});
export default require_dist();
/*! Bundled license information:

react/cjs/react-jsx-runtime.development.js:
  (**
   * @license React
   * react-jsx-runtime.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
//# sourceMappingURL=react-simple-star-rating.js.map
