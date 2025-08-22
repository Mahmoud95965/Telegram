(function(){
'use strict'

// Initialize Firebase
var firebaseApp = firebase.apps.length ? firebase.app() : firebase.initializeApp(window.firebaseConfig)
var auth = firebase.auth()

// Ensure persistence is LOCAL (default on web)
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)

// Angular module to expose Firebase auth
angular.module('myApp.firebase', [])
  .factory('FirebaseAuthService', ['$rootScope', '$q', function($rootScope, $q){
    var currentUser = null

    auth.onAuthStateChanged(function(user){
      currentUser = user || null
      $rootScope.firebaseUser = currentUser
      $rootScope.$broadcast('firebase_auth_state_changed', currentUser)
      // If Angular digest is not running, trigger it
      if (!$rootScope.$$phase) { $rootScope.$applyAsync() }
    })

    function signInWithGoogle(){
      var provider = new firebase.auth.GoogleAuthProvider()
      return auth.signInWithPopup(provider)
    }

    function signInWithEmail(email, password){
      return auth.signInWithEmailAndPassword(email, password)
    }

    function registerWithEmail(email, password){
      return auth.createUserWithEmailAndPassword(email, password)
    }

    function sendPasswordReset(email){
      return auth.sendPasswordResetEmail(email)
    }

    function signOut(){
      return auth.signOut()
    }

    return {
      getUser: function(){ return currentUser },
      onAuthStateChanged: function(cb){ return auth.onAuthStateChanged(cb) },
      signInWithGoogle: signInWithGoogle,
      signInWithEmail: signInWithEmail,
      registerWithEmail: registerWithEmail,
      sendPasswordReset: sendPasswordReset,
      signOut: signOut
    }
  }])
  .run(['$rootScope','FirebaseAuthService','$location', function($rootScope, FirebaseAuthService, $location){
    $rootScope.firebaseLogout = function(){ FirebaseAuthService.signOut() }

    // Route guard
    $rootScope.$on('$routeChangeStart', function(evt, next){
      var isLoginRoute = next && next.$$route && next.$$route.originalPath === '/login'
      var user = FirebaseAuthService.getUser()
      if (!user && !isLoginRoute) {
        evt.preventDefault()
        $location.url('/login')
      }
      if (user && isLoginRoute) {
        evt.preventDefault()
        $location.url('/im')
      }
    })
  }])

})();