// Quick Fix Script for Admin Access
// Run this in your browser console (F12) to clear auth data and reload

console.log("🔧 Clearing authentication data...");

// Show current user data
const currentUser = localStorage.getItem('user');
if (currentUser) {
    console.log("📋 Current user:", JSON.parse(currentUser));
}

// Clear all auth data
localStorage.removeItem('token');
localStorage.removeItem('user');

console.log("✅ Authentication data cleared!");
console.log("🔄 Reloading page...");

// Reload the page
window.location.href = '/login';
