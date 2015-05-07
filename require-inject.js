define(function () {
                var injectListeners = [];
                var ngInternalInjector;
                var requestedComponents = {};
                var injectionModule;

                // this is the appContext returned when we require injections
                var appContext = {
                                $injectionModule: getInjectionModule,
                                $onInject: function (listener) {
                                                injectListeners.push(listener);
                                }
                };

                // inject members to appContext
                function injectComponents() {
                                var names = injectComponents.$inject;
                                for (var i = 0, len = names.length; i < len; i++) {
                                                var name = names[i];
                                                appContext[name] = arguments[i];
                                }
                }

                function getInjectionModule() {
                                // create a module which will inject members to appContext on angular bootstrap
                                if (!injectionModule) {
                                                injectionModule = angular.module('requireJsInjection', []);
                                                injectionModule.run(function ($injector) {
                                                                ngInternalInjector = $injector;
                                                                // convert requestedComponents set to array
                                                                var names = [];
                                                                for (var name in requestedComponents) {
                                                                                if (requestedComponents.hasOwnProperty(name)) {
                                                                                                names.push(name);
                                                                                }
                                                                }

                                                                // inject components to appContext
                                                                injectComponents.$inject = names;
                                                                $injector.invoke(injectComponents);

                                                                // invoke injectListeners onInject()
                                                                for (var i = 0, len = injectListeners.length; i < len; i++) {
                                                                                injectListeners[i]();
                                                                }

                                                                // cleanup
                                                                requestedComponents = {};
                                                                injectListeners = [];
                                                });
                                }

                                return injectionModule;
                }

                function requestInject(name) {
                                if (!name) {
                                                return;
                                }

                                var names = name.split(','),
                                                i, len;

                                if (ngInternalInjector) {
                                                var injectables = [];
                                                // angular already bootstrapped, inject members immediately
                                                for (i = 0, len = names.length; i < len; i++) {
                                                                name = names[i].trim();
                                                                if (name && !appContext[name]) {
                                                                                injectables.push(name);
                                                                }
                                                }
                                                injectComponents.$inject = injectables;
                                                ngInternalInjector.invoke(injectComponents);

                                } else {
                                                // angular hasn't bootstrapped yet, add to requestedComponents set to inject later
                                                for (i = 0, len = names.length; i < len; i++) {
                                                                name = names[i].trim();
                                                                // keep components names in a set to prevent duplicates
                                                                if (name && !appContext[name]) {
                                                                                requestedComponents[name] = true;
                                                                }
                                                }
                                }
                }

                return {
                                load: function (name, parentRequire, onload, config) {
                                                requestInject(name);
                                                onload(appContext);
                                }
                }
});