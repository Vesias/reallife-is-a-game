#!/bin/bash

# Next.js 15 with Supabase - Automated Setup Script
# Production-ready deployment with performance optimization

set -e  # Exit on any error

echo "🚀 Next.js 15 Application Setup Started"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_status "Node.js version: $(node --version) ✓"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed."
        exit 1
    fi
    print_status "npm version: $(npm --version) ✓"
}

# Install dependencies
install_dependencies() {
    print_step "Installing project dependencies..."
    
    # Clear npm cache for clean install
    npm cache clean --force
    
    # Install dependencies with performance optimizations
    npm ci --prefer-offline --no-audit --progress=false
    
    print_status "Dependencies installed successfully ✓"
}

# Setup environment variables
setup_environment() {
    print_step "Setting up environment variables..."
    
    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env.local
            print_warning "Copied .env.example to .env.local - Please update with your actual values"
        else
            print_warning "No .env.example found. You'll need to create .env.local manually"
        fi
    else
        print_status "Environment file .env.local already exists ✓"
    fi
}

# Build the application
build_app() {
    print_step "Building the application..."
    
    # Type checking
    print_status "Running type check..."
    npm run type-check
    
    # Linting
    print_status "Running linter..."
    npm run lint
    
    # Build
    print_status "Building for production..."
    npm run build
    
    print_status "Build completed successfully ✓"
}

# Run tests
run_tests() {
    print_step "Running tests..."
    
    # Unit tests
    npm test -- --passWithNoTests
    
    print_status "All tests passed ✓"
}

# Setup Git hooks (if git repository exists)
setup_git_hooks() {
    if [ -d ".git" ]; then
        print_step "Setting up Git hooks..."
        
        # Create pre-commit hook
        mkdir -p .git/hooks
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook for Next.js app

echo "Running pre-commit checks..."

# Run linter
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting failed. Please fix the issues and try again."
    exit 1
fi

# Run type check
npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ Type checking failed. Please fix the issues and try again."
    exit 1
fi

# Run tests
npm test -- --passWithNoTests
if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Please fix the issues and try again."
    exit 1
fi

echo "✅ Pre-commit checks passed!"
EOF
        
        chmod +x .git/hooks/pre-commit
        print_status "Git hooks configured ✓"
    else
        print_warning "Not a git repository - skipping Git hooks setup"
    fi
}

# Performance optimization
optimize_performance() {
    print_step "Applying performance optimizations..."
    
    # Create performance monitoring directory
    mkdir -p logs
    
    # Set Node.js performance flags
    export NODE_OPTIONS="--max-old-space-size=4096 --optimize-for-size"
    
    print_status "Performance optimizations applied ✓"
}

# Security check
security_check() {
    print_step "Running security audit..."
    
    # NPM audit
    npm audit --audit-level=moderate || print_warning "Some security vulnerabilities found. Review npm audit output."
    
    print_status "Security audit completed ✓"
}

# Cleanup
cleanup() {
    print_step "Cleaning up..."
    
    # Remove node_modules/.cache if exists
    rm -rf node_modules/.cache
    
    # Clear Next.js cache
    rm -rf .next/cache
    
    print_status "Cleanup completed ✓"
}

# Main setup function
main() {
    echo "Starting automated setup process..."
    echo
    
    # Pre-flight checks
    check_node
    check_npm
    
    # Setup steps
    install_dependencies
    setup_environment
    optimize_performance
    run_tests
    build_app
    setup_git_hooks
    security_check
    cleanup
    
    echo
    echo "🎉 Setup completed successfully!"
    echo "=============================="
    echo
    print_status "Next steps:"
    echo "  1. Update .env.local with your Supabase credentials"
    echo "  2. Run 'npm run dev' to start development server"
    echo "  3. Run 'npm run build && npm start' for production"
    echo "  4. Check docs/QUICKSTART.md for detailed instructions"
    echo
    print_status "Available commands:"
    echo "  - npm run dev        # Start development server"
    echo "  - npm run build      # Build for production"
    echo "  - npm run start      # Start production server"
    echo "  - npm run test       # Run tests"
    echo "  - npm run lint       # Run linter"
    echo "  - npm run type-check # Run type checking"
    echo
}

# Handle script arguments
case "${1:-}" in
    "--help" | "-h")
        echo "Usage: $0 [options]"
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --no-build     Skip build step"
        echo "  --no-test      Skip test step"
        echo "  --dev-only     Setup for development only"
        exit 0
        ;;
    "--no-build")
        main_no_build() {
            check_node
            check_npm
            install_dependencies
            setup_environment
            optimize_performance
            run_tests
            setup_git_hooks
            security_check
            cleanup
        }
        main_no_build
        ;;
    "--no-test")
        main_no_test() {
            check_node
            check_npm
            install_dependencies
            setup_environment
            optimize_performance
            build_app
            setup_git_hooks
            security_check
            cleanup
        }
        main_no_test
        ;;
    "--dev-only")
        dev_setup() {
            check_node
            check_npm
            install_dependencies
            setup_environment
            print_status "Development setup complete! Run 'npm run dev' to start."
        }
        dev_setup
        ;;
    *)
        main
        ;;
esac