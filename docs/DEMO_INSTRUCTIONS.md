# Demo Instructions for Authentication UI

## 🚀 Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env.local` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Start Development Server
```bash
npm run dev
```

The application will start on `http://localhost:3000` (or 3001 if 3000 is in use).

## 🎬 Demo Flow

### **Step 1: Landing Page**
- Visit `http://localhost:3000`
- See the modern landing page with:
  - Dynamic navbar (shows Sign In/Sign Up when not authenticated)
  - Hero section with call-to-action buttons
  - Feature showcase cards
  - Responsive design

### **Step 2: Sign Up Flow**
1. Click "Get Started" or "Sign Up" button
2. Navigate to `/signup`
3. Fill out the signup form:
   - Enter a valid email address
   - Enter a password (minimum 6 characters)
   - See real-time validation errors
4. Submit the form
5. Upon successful signup:
   - Automatically redirected to dashboard
   - Navbar updates to show user avatar

### **Step 3: Dashboard Experience**
- View the protected dashboard at `/dashboard`
- See user profile information:
  - Email address
  - Account creation date  
  - Email verification status
- Explore quick action buttons
- Check recent activity section

### **Step 4: Navigation Testing**
1. Click on user avatar in navbar
2. See dropdown menu with:
   - User email
   - Profile option
   - Settings option
   - Log out option
3. Click "Log out"
4. Automatically redirected to home page
5. Navbar updates to show Sign In/Sign Up buttons

### **Step 5: Sign In Flow**
1. Click "Sign In" button
2. Navigate to `/login`
3. Fill out login form with existing credentials
4. Submit and get redirected to dashboard

## 🎯 Component Testing

### **Form Validation Testing**
1. **Email validation**:
   - Try invalid emails: `test`, `test@`, `@example.com`
   - See "Invalid email address" error

2. **Password validation**:
   - Try passwords shorter than 6 characters
   - See "Password must be at least 6 characters" error

3. **Real-time validation**:
   - Errors appear as you type
   - Errors clear when input becomes valid

### **Loading States**
1. Submit forms to see loading spinners
2. Form becomes disabled during submission
3. Button shows loading state with spinner

### **Error Handling**
1. Try logging in with invalid credentials
2. See authentication error messages
3. Error messages are user-friendly

### **Protected Routes**
1. Try accessing `/dashboard` when not logged in
2. Automatically redirected to `/login`
3. After login, redirected back to intended page

### **Responsive Design**
1. Resize browser window
2. Check mobile responsiveness:
   - Forms adapt to smaller screens
   - Navigation remains functional
   - Cards stack properly
   - Text remains readable

## 🔧 Advanced Features

### **Auto-Redirect Behavior**
- Authenticated users trying to access `/login` or `/signup` → redirected to `/dashboard`
- Unauthenticated users trying to access `/dashboard` → redirected to `/login`
- After successful login/signup → redirected to `/dashboard`

### **State Management**
- Authentication state persists across page refreshes
- Real-time updates when auth state changes
- Proper loading states during auth checks

### **UI Components**
- All forms use shadcn/ui components
- Consistent design system throughout
- Accessible components with proper ARIA labels
- Modern card-based layouts

## 🐛 Troubleshooting

### **Common Issues**
1. **Port already in use**: App will automatically use next available port
2. **Supabase errors**: Check your environment variables
3. **Build errors**: Run `npm run build` to check for issues

### **Development Tips**
1. Open browser dev tools to see network requests
2. Check console for any JavaScript errors  
3. Use React DevTools to inspect component state
4. Monitor Supabase dashboard for auth events

## 📱 Mobile Testing
1. Open Chrome DevTools
2. Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
3. Test on different device sizes:
   - iPhone SE (375px)
   - iPad (768px)  
   - Desktop (1200px+)

## 🎨 UI Components Showcase
Each page demonstrates different shadcn/ui components:
- **Cards**: Profile cards, feature cards
- **Forms**: Login/signup forms with validation
- **Buttons**: Primary, secondary, outline variants
- **Navigation**: Dropdown menus, responsive navbar
- **Loading**: Spinners and loading states
- **Typography**: Headings, descriptions, labels

The demo showcases a complete, production-ready authentication system with modern UI components!