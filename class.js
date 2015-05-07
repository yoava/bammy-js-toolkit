define(function () {
                /**
                * Defines a new class.
                *
                * @param def definition object
                * @returns Constructor class
                */
                function Class(def) {
                                // quick reference variables
                                var _super = def.extend || Class.Base;
                                var constructor = def.init;

                                // setup default c'tor (call super)
                                if (!constructor) {
                                                constructor = function () {
                                                                _super.apply(this, arguments);
                                                };
                                }

                                // setup temp base class with empty c'tor
                                var tempBase = function () {
                                };
                                tempBase.prototype = _super.prototype;

                                // setup inheritance
                                var prototype = new tempBase();
                                constructor.prototype = prototype;

                                // copy class definition members to prototype
                                for (var key in def) {
                                                if (def.hasOwnProperty(key)) {
                                                                prototype[key] = def[key];
                                                }
                                }

                                // fix c'tor reference
                                constructor.prototype.constructor = constructor;
                                constructor._cache = {};
                                return constructor;
                }

                // Base class
                Class.Base = function Base() {
                };

                Class.Base.prototype.$super = function Base$super(methodName) {
                                var method = this.extend.prototype[methodName];
                                if (arguments.length > 1) {
                                                var args = Array.prototype.slice.call(arguments, 1);
                                                return method.apply(this, args);
                                } else {
                                                return  method.apply(this);
                                }
                };

                Class.Base.prototype.init = function Base$init() {
                };

                return Class;
});