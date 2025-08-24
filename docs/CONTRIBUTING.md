# 🤝 Contributing to LifeQuest

> **Join the 1% building the future of AI-assisted life gamification**

We welcome contributions from developers, designers, writers, and AI enthusiasts who want to help build the ultimate Real-Life Agent ID Connector. Every contribution helps make LifeQuest better for the global community.

## 🎯 How to Contribute

### 🔍 Ways to Contribute
- **Code**: Features, bug fixes, performance improvements
- **Documentation**: Guides, tutorials, API documentation
- **Design**: UI/UX improvements, icons, illustrations
- **Testing**: Bug reports, test cases, QA feedback
- **Community**: Discord moderation, user support, translations
- **Ideas**: Feature requests, architectural suggestions

### 💡 Contribution Priorities
1. **Core Gamification** - Quest system improvements
2. **AI Integration** - MCP and E2B enhancements
3. **User Experience** - Interface and workflow optimization
4. **Performance** - Speed and scalability improvements
5. **Security** - Authentication and data protection
6. **Mobile Experience** - Responsive design enhancements
7. **Internationalization** - Multi-language support

## 🚀 Getting Started

### 1. Development Setup

#### Prerequisites
- Node.js 18.0+ 
- npm/yarn/pnpm
- Git
- Supabase account (for database)
- E2B account (for code execution)

#### Quick Setup
```bash
# Fork and clone the repository
git clone https://github.com/your-username/lifequest.git
cd lifequest

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Set up environment variables (see SUPABASE_SETUP.md)
# Edit .env.local with your keys

# Run database migrations
npx supabase db reset

# Start development server
npm run dev

# Run tests to ensure everything works
npm run test
```

#### Project Structure
```
lifequest/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Authentication routes
│   ├── api/               # API endpoints
│   ├── dashboard/         # Main dashboard
│   ├── quests/            # Quest management
│   └── crew/              # Team collaboration
├── components/            # Reusable UI components
│   ├── auth/              # Authentication components
│   ├── gamification/      # XP, badges, leaderboards
│   ├── quests/            # Quest-related components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility libraries
│   ├── e2b/               # Code interpreter integration
│   ├── supabase.ts        # Database client
│   └── utils.ts           # Helper functions
├── docs/                  # Documentation
└── tests/                 # Test suites
```

### 2. Development Workflow

#### Creating Issues
Before starting work, create or find an issue:
1. **Search existing issues** to avoid duplicates
2. **Use issue templates** for bugs and features
3. **Add appropriate labels** (`bug`, `enhancement`, `documentation`)
4. **Assign yourself** if you plan to work on it

#### Branch Naming Convention
```bash
# Feature branches
git checkout -b feature/quest-templates
git checkout -b feature/ai-coach-integration

# Bug fixes
git checkout -b fix/dashboard-loading-error
git checkout -b fix/auth-token-refresh

# Documentation
git checkout -b docs/mcp-setup-guide
git checkout -b docs/api-reference

# Performance improvements
git checkout -b perf/quest-loading-optimization
git checkout -b perf/database-query-optimization
```

#### Commit Message Format
We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Features
git commit -m "feat(quests): add quest template system"
git commit -m "feat(ai): integrate Claude MCP for quest coaching"

# Bug fixes
git commit -m "fix(auth): resolve token refresh issue"
git commit -m "fix(ui): correct mobile dashboard layout"

# Documentation
git commit -m "docs(setup): add MCP integration guide"
git commit -m "docs(api): update quest endpoints documentation"

# Performance
git commit -m "perf(db): optimize quest loading queries"
git commit -m "perf(ui): lazy load dashboard components"

# Refactoring
git commit -m "refactor(components): extract quest card logic"
git commit -m "refactor(hooks): simplify auth state management"
```

## 📋 Development Guidelines

### 🎨 Code Style

#### TypeScript Best Practices
```typescript
// Use strict typing
interface QuestData {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  createdAt: Date;
}

// Prefer type inference where possible
const createQuest = (data: Omit<QuestData, 'id' | 'createdAt'>) => {
  return {
    ...data,
    id: generateId(),
    createdAt: new Date()
  };
};

// Use utility types
type UpdateQuestData = Partial<Pick<QuestData, 'title' | 'description'>>;
```

#### React Best Practices
```jsx
// Use functional components with hooks
export function QuestCard({ quest, onUpdate }: QuestCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Memoize expensive computations
  const progressPercent = useMemo(() => {
    return calculateProgress(quest);
  }, [quest.completedTasks, quest.totalTasks]);

  // Extract complex logic to custom hooks
  const { updateProgress, isUpdating } = useQuestProgress(quest.id);

  return (
    <Card className="quest-card">
      {/* Component JSX */}
    </Card>
  );
}
```

#### Styling Guidelines
```tsx
// Use Tailwind utility classes with semantic grouping
<div className={cn(
  // Layout
  "flex flex-col space-y-4 p-6",
  // Visual styling
  "bg-white dark:bg-gray-900 rounded-lg shadow-lg",
  // Interactive states
  "hover:shadow-xl transition-shadow duration-200",
  // Responsive design
  "sm:p-8 md:flex-row md:space-y-0 md:space-x-6"
)}>

// Create reusable style variants with class-variance-authority
const cardVariants = cva(
  "rounded-lg border shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-white border-gray-200",
        destructive: "bg-red-50 border-red-200",
        success: "bg-green-50 border-green-200"
      },
      size: {
        sm: "p-4",
        md: "p-6", 
        lg: "p-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);
```

### 🗃️ Database Guidelines

#### Schema Design
```sql
-- Use clear, descriptive names
create table user_quests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null check (length(title) >= 3),
  description text,
  xp_reward integer default 0 check (xp_reward >= 0),
  difficulty quest_difficulty default 'medium',
  status quest_status default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add performance indexes
create index idx_user_quests_user_id on user_quests(user_id);
create index idx_user_quests_status on user_quests(status) where status = 'active';
```

#### RLS Policies
```sql
-- Always implement Row Level Security
alter table user_quests enable row level security;

-- Clear policy names and descriptions
create policy "Users can view their own quests"
  on user_quests for select
  using (auth.uid() = user_id);

create policy "Users can create their own quests"
  on user_quests for insert
  with check (auth.uid() = user_id);
```

### 🧪 Testing Guidelines

#### Unit Tests
```javascript
// components/__tests__/quest-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestCard } from '../quest-card';
import { mockQuest } from '../../../__mocks__/quest-data';

describe('QuestCard', () => {
  it('displays quest title and description', () => {
    render(<QuestCard quest={mockQuest} />);
    
    expect(screen.getByText(mockQuest.title)).toBeInTheDocument();
    expect(screen.getByText(mockQuest.description)).toBeInTheDocument();
  });

  it('calls onUpdate when progress is updated', async () => {
    const onUpdate = jest.fn();
    render(<QuestCard quest={mockQuest} onUpdate={onUpdate} />);
    
    const updateButton = screen.getByText('Update Progress');
    fireEvent.click(updateButton);
    
    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(mockQuest.id);
    });
  });
});
```

#### API Tests
```javascript
// app/api/quests/__tests__/route.test.ts
import { POST } from '../route';
import { createMockRequest } from '../../../../test-utils';

describe('/api/quests', () => {
  it('creates a quest successfully', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: { title: 'Test Quest', description: 'Test description' }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.quest.title).toBe('Test Quest');
  });
});
```

#### E2E Tests
```javascript
// cypress/e2e/quest-creation.cy.ts
describe('Quest Creation', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password');
  });

  it('creates and completes a basic quest', () => {
    cy.visit('/quests/create');
    
    cy.get('[data-cy="quest-title"]').type('Learn TypeScript');
    cy.get('[data-cy="quest-description"]').type('Complete TypeScript tutorial');
    cy.get('[data-cy="submit-quest"]').click();
    
    cy.url().should('include', '/dashboard');
    cy.contains('Learn TypeScript').should('be.visible');
  });
});
```

## 🎯 Feature Development

### 1. Quest System Features

#### Adding New Quest Types
```typescript
// types/quests.ts
export type QuestType = 
  | 'habit_tracker'
  | 'learning_path'
  | 'coding_challenge'
  | 'fitness_goal'
  | 'creative_project'
  | 'your_new_type'; // Add here

// lib/quests/quest-factory.ts
export class QuestFactory {
  static createQuest(type: QuestType, data: any): Quest {
    switch (type) {
      case 'your_new_type':
        return new YourNewQuestType(data);
      default:
        return new BasicQuest(data);
    }
  }
}
```

#### Quest Validation Logic
```typescript
// lib/quests/validators.ts
export const questValidators = {
  title: (value: string) => {
    if (value.length < 3) return 'Title must be at least 3 characters';
    if (value.length > 100) return 'Title must be less than 100 characters';
    return null;
  },
  
  xpReward: (value: number) => {
    if (value < 0) return 'XP reward cannot be negative';
    if (value > 10000) return 'XP reward too high';
    return null;
  }
};
```

### 2. AI Integration Features

#### Adding New MCP Tools
```typescript
// lib/mcp/tools/custom-tool.ts
export const customMCPTool: MCPTool = {
  name: 'analyze_user_patterns',
  description: 'Analyze user behavior patterns for quest optimization',
  
  inputSchema: {
    type: 'object',
    properties: {
      userId: { type: 'string' },
      timeframe: { type: 'string', enum: ['week', 'month', 'quarter'] }
    },
    required: ['userId']
  },
  
  async execute(params: { userId: string; timeframe?: string }) {
    // Your analysis logic here
    const patterns = await analyzeUserBehavior(params);
    return patterns;
  }
};
```

#### E2B Code Templates
```python
# templates/quest-validator.py
"""
LifeQuest code execution template for quest validation
"""
import json
import sys
from typing import Any, Dict

def validate_quest_completion(code_result: Any, expected_result: Any) -> Dict[str, Any]:
    """Validate if quest code execution meets requirements"""
    try:
        if code_result == expected_result:
            return {
                "success": True,
                "xp_earned": 100,
                "message": "Quest completed successfully!"
            }
        else:
            return {
                "success": False,
                "xp_earned": 25,
                "message": f"Expected {expected_result}, got {code_result}"
            }
    except Exception as e:
        return {
            "success": False,
            "xp_earned": 0,
            "error": str(e)
        }
```

## 🌐 Internationalization

### Adding New Languages
```json
// locales/es/common.json (Spanish example)
{
  "quests": {
    "title": "Misiones",
    "create": "Crear Misión",
    "complete": "Completar",
    "difficulty": {
      "easy": "Fácil",
      "medium": "Medio", 
      "hard": "Difícil",
      "epic": "Épico"
    }
  },
  "gamification": {
    "xp": "Puntos de Experiencia",
    "level": "Nivel",
    "achievements": "Logros"
  }
}
```

### Translation Components
```tsx
// components/i18n/quest-translator.tsx
import { useTranslation } from 'next-i18next';

export function QuestTranslator({ questKey, fallback }: {
  questKey: string;
  fallback: string;
}) {
  const { t } = useTranslation('quests');
  return <span>{t(questKey, fallback)}</span>;
}
```

## 📊 Performance Guidelines

### Database Optimization
```sql
-- Index commonly queried columns
create index idx_quests_user_status on user_quests(user_id, status);
create index idx_quests_created_at on user_quests(created_at desc);

-- Use partial indexes for better performance
create index idx_active_quests on user_quests(user_id, updated_at) 
where status = 'active';
```

### React Performance
```tsx
// Memoize expensive components
export const QuestList = memo(function QuestList({ quests, onUpdate }) {
  return (
    <>
      {quests.map(quest => (
        <QuestCard 
          key={quest.id} 
          quest={quest} 
          onUpdate={onUpdate} 
        />
      ))}
    </>
  );
});

// Use useCallback for stable references
const handleQuestUpdate = useCallback((questId: string) => {
  // Update logic
}, []);
```

## 🔒 Security Guidelines

### Input Validation
```typescript
// lib/validation/quest-schema.ts
import { z } from 'zod';

export const createQuestSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title too long')
    .regex(/^[a-zA-Z0-9\s\-_.,!?]+$/, 'Invalid characters in title'),
    
  description: z.string()
    .max(1000, 'Description too long')
    .optional(),
    
  xpReward: z.number()
    .min(0, 'XP reward cannot be negative')
    .max(10000, 'XP reward too high')
    .int('XP reward must be an integer')
});
```

### API Security
```typescript
// lib/auth/api-protection.ts
export async function withAuth<T>(
  handler: (req: Request, user: User) => Promise<T>
) {
  return async (req: Request) => {
    try {
      const user = await validateApiUser(req);
      return await handler(req, user);
    } catch (error) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
  };
}
```

## 🚀 Pull Request Process

### 1. Before Submitting
- [ ] Code follows style guidelines
- [ ] Tests pass (`npm run test`)
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Documentation updated (if needed)

### 2. Pull Request Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots to help reviewers understand the changes.

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
```

### 3. Review Process
1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Code Review**: Maintainers review code for quality and consistency
3. **Testing**: Manual testing of new features
4. **Documentation**: Check if docs need updates
5. **Merge**: Squash and merge after approval

## 🎖️ Recognition

### Contributor Levels
- **First-time Contributor**: First merged PR
- **Regular Contributor**: 5+ merged PRs
- **Core Contributor**: 20+ merged PRs + architectural contributions
- **Maintainer**: Trusted community member with write access

### Recognition Program
- **Contributors Wall**: GitHub README recognition
- **Discord Roles**: Special roles in community Discord  
- **Early Access**: Preview new features before release
- **Swag**: LifeQuest merchandise for significant contributions
- **Conference Talks**: Opportunity to speak about LifeQuest

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Discord**: Real-time chat with community
- **Email**: [contribute@lifequest.dev](mailto:contribute@lifequest.dev)

### Mentorship Program
New contributors can request mentorship from experienced contributors:
1. **Comment on issues** tagged with `good-first-issue`
2. **Join Discord** and ask in #mentorship channel
3. **Attend office hours** (Fridays 2-4 PM CET)

## 📚 Resources

### Development Resources
- **[Next.js Documentation](https://nextjs.org/docs)**
- **[Supabase Documentation](https://supabase.com/docs)**
- **[shadcn/ui Components](https://ui.shadcn.com/)**
- **[E2B Code Interpreter](https://e2b.dev/docs)**

### LifeQuest Specific
- **[Architecture Overview](./ARCHITECTURE.md)**
- **[API Documentation](./API.md)**
- **[Deployment Guide](./DEPLOYMENT.md)**
- **[MCP Integration](./MCP_INTEGRATION.md)**

---

**Thank you for contributing to LifeQuest!** 

Your contributions help build the future of AI-assisted life gamification. Together, we're creating the cheat code for the 1% who want to thrive in the AI era.

**Ready to make your first contribution?** Check out issues labeled [`good-first-issue`](https://github.com/your-username/lifequest/labels/good-first-issue) to get started!