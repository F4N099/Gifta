export interface Translation {
  translation: {
    'app.title': string;
    'app.description': string;
    
    // Form
    'form.description.label': string;
    'form.description.placeholder': string;
    'form.interests.label': string;
    'form.interests.placeholder': string;
    'form.budget.label': string;
    'form.budget.placeholder': string;
    'form.submit': string;
    
    // Gift
    'gift.matches.title': string;
    'gift.cta.buy': string;
    'gift.cta.details': string;
    'gift.save': string;
    'gift.unsave': string;
    'gift.saved.success': string;
    'gift.removed.success': string;
    'gift.error.save': string;
    'gift.error.remove': string;
    'gift.login.required': string;
    
    // Authentication
    'auth.welcome': string;
    'auth.signin': string;
    'auth.signup': string;
    'auth.signup.description': string;
    'auth.email': string;
    'auth.password': string;
    'auth.password.confirm': string;
    'auth.password.requirements': string;
    'auth.name': string;
    'auth.forgot': string;
    'auth.reset': string;
    'auth.reset.description': string;
    'auth.reset.success': string;
    'auth.reset.success.description': string;
    'auth.login': string;
    'auth.register': string;
    'auth.logout': string;
    'auth.account.exists': string;
    'auth.account.none': string;
    'auth.loading': string;
    'auth.creating': string;
    
    // Profile
    'profile.title': string;
    'profile.personal': string;
    'profile.avatar': string;
    'profile.avatar.requirements': string;
    'profile.email.settings': string;
    'profile.email.current': string;
    'profile.email.new': string;
    'profile.password.settings': string;
    'profile.password.current': string;
    'profile.password.new': string;
    'profile.save': string;
    'profile.saving': string;
    'profile.updated': string;
    'profile.error': string;
    
    // Account Deletion
    'account.delete': string;
    'account.delete.warning': string;
    'account.delete.description': string;
    'account.delete.confirm': string;
    'account.delete.success': string;
    'account.delete.error': string;
    
    // Saved Gifts
    'saved.title': string;
    'saved.description': string;
    'saved.empty': string;
    'saved.empty.description': string;
    
    // Registration Success
    'register.success.title': string;
    'register.success.description': string;
    'register.success.cta': string;
    'register.success.help': string;
    'register.success.support': string;
    
    // Common actions
    'action.tryAgain': string;
    'action.startOver': string;
    'action.back': string;
    'action.continue': string;
    'action.cancel': string;
    'action.confirm': string;
    
    // Navigation
    'nav.home': string;
    'nav.profile': string;
    'nav.saved': string;
    'nav.help': string;
    
    // Footer
    'footer.support': string;
    
    // Suggestions
    'suggestions.travel': string;
    'suggestions.books': string;
    'suggestions.videogames': string;
    'suggestions.plants': string;
    'suggestions.design': string;
    'suggestions.fashion': string;
    
    // Error messages
    'error.title': string;
    'error.generic': string;
    'error.retry': string;
    'error.session': string;
    
    // Theme
    'theme.light': string;
    'theme.dark': string;
  };
}