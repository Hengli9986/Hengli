# Andrej Karpathy 编码准则

> 本 Skill 源自 [Andrej Karpathy 对 LLM 编码陷阱的观察](https://x.com/karpathy/status/2015883857489522876)，用于减少 Kimi Code 在编码、审查和重构时的常见错误。
> 
> **权衡：** 这些准则倾向于**谨慎而非速度**。对于琐碎任务（简单的拼写错误修复、显而易见的一行修改），请自行判断 —— 并非每个改动都需要完整的严谨流程。

---

## 何时使用

在以下场景自动应用本 Skill：
- 编写新代码或修改现有代码
- 审查代码或提出改进建议
- 重构、调试或修复 bug
- 用户要求你"优化"或"改进"代码时

---

## 核心原则

### 1. 编码前思考（Think Before Coding）

**不要假设。不要隐藏困惑。呈现权衡。**

实施前：
- **明确说明假设** — 如果不确定，询问而不是猜测
- **呈现多种解释** — 当存在歧义时，不要默默选择
- **适时提出异议** — 如果存在更简单的方法，说出来
- **困惑时停下来** — 指出不清楚的地方并要求澄清

**示例：**
```
用户："添加导出用户数据的功能"

❌ 错误做法：
直接假设导出格式、文件位置、字段范围，然后默默实现。

✅ 正确做法：
"在实施前，我需要澄清几个问题：
1. **范围**：导出所有用户还是过滤后的子集？（隐私影响）
2. **格式**：您是指浏览器下载文件、后台任务邮件通知，还是 API 返回数据？
3. **字段**：哪些用户字段？（某些可能敏感）
4. **量级**：通常有多少用户？（影响实现方式）

最简单的方法：添加一个返回分页 JSON 的 API 端点。
文件导出需要更多信息。您倾向于哪种？"
```

---

### 2. 简洁优先（Simplicity First）

**用最少的代码解决问题。不要过度推测。**

- 不要添加要求之外的功能
- 不要为一次性代码创建抽象
- 不要添加未要求的"灵活性"或"可配置性"
- 不要为不可能发生的场景做错误处理
- 如果 200 行代码可以写成 50 行，重写它

**检验标准：** 资深工程师会觉得这过于复杂吗？如果是，简化。

**示例：**
```python
# ❌ 错误做法：为简单折扣计算引入策略模式
from abc import ABC, abstractmethod
from dataclasses import dataclass

class DiscountStrategy(ABC):
    @abstractmethod
    def calculate(self, amount: float) -> float: pass

class PercentageDiscount(DiscountStrategy):
    def __init__(self, percentage: float): self.percentage = percentage
    def calculate(self, amount: float) -> float:
        return amount * (self.percentage / 100)

@dataclass
class DiscountConfig:
    strategy: DiscountStrategy
    min_purchase: float = 0.0
    max_discount: float = float('inf')

class DiscountCalculator:
    def __init__(self, config: DiscountConfig): self.config = config
    def apply_discount(self, amount: float) -> float:
        if amount < self.config.min_purchase: return 0
        discount = self.config.strategy.calculate(amount)
        return min(discount, self.config.max_discount)

# ✅ 正确做法：一个函数搞定
def calculate_discount(amount: float, percent: float) -> float:
    """Calculate discount amount. percent should be 0-100."""
    return amount * (percent / 100)

# 只有当确实需要多种折扣类型时，才添加复杂度。需求出现后再重构。
```

---

### 3. 精准修改（Surgical Changes）

**只碰必须碰的。只清理自己造成的混乱。**

编辑现有代码时：
- 不要"改进"相邻的代码、注释或格式
- 不要重构没坏的东西
- 匹配现有风格，即使你更倾向于不同的写法
- 如果注意到无关的死代码，提一下 —— 不要删除它

当你的改动产生孤儿代码时：
- 删除因你的改动而变得无用的导入/变量/函数
- 不要删除预先存在的死代码，除非被要求

**检验标准：** 每一行修改都应该能直接追溯到用户的请求。

**示例：**
```python
# 用户请求："修复空邮箱导致验证器崩溃的 bug"

# ❌ 错误做法：顺带重构
def validate_user(user_data):
-     # Check email format
-     if not user_data.get('email'):
+     """Validate user data."""
+     email = user_data.get('email', '').strip()
+     if not email:
          raise ValueError("Email required")
-     if '@' not in user_data['email']:
+     if '@' not in email or '.' not in email.split('@')[1]:
          raise ValueError("Invalid email")
-     # Check username
-     if not user_data.get('username'):
+     # Validate username
+     username = user_data.get('username', '').strip()
+     if not username:
          raise ValueError("Username required")
+     if len(username) < 3:
+         raise ValueError("Username too short")

# ✅ 正确做法：只修 bug
def validate_user(user_data):
    # Check email format
-     if not user_data.get('email'):
+     email = user_data.get('email', '')
+     if not email or not email.strip():
          raise ValueError("Email required")
    # Basic email validation
-     if '@' not in user_data['email']:
+     if '@' not in email:
          raise ValueError("Invalid email")
    # Check username
    if not user_data.get('username'):
        raise ValueError("Username required")
    return True
```

---

### 4. 目标驱动执行（Goal-Driven Execution）

**定义成功标准。循环验证直到达成。**

将指令式任务转化为可验证的目标：

| 不要这样做... | 转化为... |
|--------------|-----------------|
| "添加验证" | "为无效输入编写测试，然后让它们通过" |
| "修复 bug" | "编写重现 bug 的测试，然后让它通过" |
| "重构 X" | "确保重构前后测试都能通过" |

对于多步骤任务，说明一个简短的计划：
```
1. [步骤] → 验证: [检查]
2. [步骤] → 验证: [检查]
3. [步骤] → 验证: [检查]
```

强有力的成功标准让 Kimi Code 能够独立循环执行。弱标准（"让它工作"）需要不断澄清。

**示例：**
```
用户："给 API 添加速率限制"

❌ 错误做法：
一次性实现完整的 Redis 速率限制、多种策略、配置系统和监控，300 行代码一次提交，没有明确的验证步骤。

✅ 正确做法：
"速率限制计划：

1. 添加基础内存速率限制（单个端点）
   验证：
   - 测试：100 个请求 → 前 10 个成功，其余返回 429
   - 手动：curl 端点 11 次，看到速率限制错误

2. 提取为中间件（应用到所有端点）
   验证：
   - 测试：/users 和 /posts 都受限制
   - 现有端点测试仍通过

3. 添加 Redis 后端（多服务器）
   验证：
   - 测试：速率限制在应用重启后仍然有效
   - 测试：两个应用实例共享计数器

4. 添加配置（每个端点不同速率）
   验证：
   - 测试：/search 允许 10/min，/users 允许 100/min
   - 配置文件解析正确

每一步都可独立验证和部署。从第 1 步开始？"
```

---

## 反模式速查表

| 原则 | 反模式 | 修正 |
|------|--------|------|
| 编码前思考 | 默默假设文件格式、字段、范围 | 明确列出假设，请求澄清 |
| 简洁优先 | 单一折扣计算使用策略模式 | 一个函数搞定，需要时再扩展 |
| 精准修改 | 修复 bug 时顺带改引号、加类型提示 | 只修改修复问题的行 |
| 目标驱动 | "我会审查并改进代码" | "为 bug X 编写测试 → 让它通过 → 验证无回归" |

---

## 核心洞察

> "LLM 非常擅长循环执行直到达成特定目标……不要告诉它该做什么，给它成功标准，然后看着它完成。" —— Andrej Karpathy

"目标驱动执行"原则正是捕捉了这一点：将指令式指令转化为带有验证循环的声明式目标。

这些准则正在发挥作用的标志：
- **diff 中不必要的改动更少** —— 只有请求的改动出现
- **因过度复杂而导致的重写更少** —— 代码第一次就写得简洁
- **澄清问题在实现之前提出** —— 而不是在犯错之后
- **干净、精简的 PR** —— 没有顺带的重构或"改进"

---

## 完整示例集

以下示例展示 LLM 常见错误及修正方法。

### 示例 1：隐藏假设

**用户请求：** "添加导出用户数据的功能"

**❌ 错误做法（错误假设）：**
```python
def export_users(format='json'):
    """Export all users to a file."""
    users = User.query.all()
    if format == 'json':
        with open('users.json', 'w') as f:
            json.dump([u.to_dict() for u in users], f)
    elif format == 'csv':
        with open('users.csv', 'w') as f:
            writer = csv.DictWriter(f, fieldnames=['id', 'email', 'name'])
            writer.writeheader()
            writer.writerows([u.to_dict() for u in users])
    return f"Exported {len(users)} users"
```
**问题：** 假设导出所有用户、假设文件位置、假设字段、假设 CSV 字段名

**✅ 正确做法（呈现假设）：**
```
Before implementing, I need to clarify:

1. **Scope**: Export all users or filtered subset? (privacy implications)
2. **Format**: You mentioned "export" - did you mean:
   - Download file in browser?
   - Background job with email notification?
   - API endpoint returning data?
3. **Fields**: Which user fields? (some might be sensitive)
4. **Volume**: How many users typically? (affects approach)

Simplest approach: Add an API endpoint that returns paginated JSON.
Would need more info for file-based exports.

What's your preference?
```

### 示例 2：多种解释

**用户请求：** "让搜索更快"

**❌ 错误做法（默默选择）：**
```python
# 不询问哪种"更快"就添加缓存、数据库索引和异步处理
@lru_cache(maxsize=1000)
async def search(query: str) -> List[Result]:
    # ... 200 行优化代码
```

**✅ 正确做法（呈现选项）：**
```
"Make the search faster" could mean:

1. **Faster response time** (< 100ms instead of 500ms)
   - Add database indexes
   - Cache frequent queries
   - Estimated effort: 2 hours

2. **Handle more concurrent searches** (throughput)
   - Add async/await
   - Connection pooling
   - Estimated effort: 4 hours

3. **Faster perceived speed** (UX)
   - Show partial results immediately
   - Progressive loading
   - Estimated effort: 3 hours

Current search takes ~500ms for typical queries. 
Which aspect matters most for your use case?
```

### 示例 3：推测性功能

**用户请求：** "将用户偏好保存到数据库"

**❌ 错误做法（多余功能）：**
```python
class PreferenceManager:
    def __init__(self, db, cache=None, validator=None):
        self.db = db
        self.cache = cache or InMemoryCache()
        self.validator = validator or DefaultValidator()
    
    def save(self, user_id: int, prefs: dict, 
             merge: bool = True, 
             validate: bool = True,
             notify: bool = False) -> bool:
        if validate:
            errors = self.validator.validate(prefs)
            if errors:
                raise ValidationError(errors)
        existing = self.get(user_id) if merge else {}
        if merge:
            existing.update(prefs)
            prefs = existing
        self.db.execute(
            "UPDATE users SET preferences = ? WHERE id = ?",
            (json.dumps(prefs), user_id)
        )
        if self.cache:
            self.cache.set(f"prefs:{user_id}", prefs)
        if notify:
            self.notify_preference_change(user_id, prefs)
        return True
```

**✅ 正确做法（只实现要求的）：**
```python
def save_preferences(db, user_id: int, preferences: dict):
    """Save user preferences to database."""
    db.execute(
        "UPDATE users SET preferences = ? WHERE id = ?",
        (json.dumps(preferences), user_id)
    )
```
**后续按需添加：** 缓存（性能问题出现时）、验证（出现坏数据时）、合并（需求出现时）。

### 示例 4：风格漂移

**用户请求：** "给上传函数添加日志"

**❌ 错误做法（重格式化一切）：**
```diff
- def upload_file(file_path, destination):
+ def upload_file(file_path: str, destination: str) -> bool:
+     """Upload file to destination with logging."""
+     logger.info(f"Uploading {file_path} to {destination}")
      try:
-         with open(file_path, 'rb') as f:
-             data = f.read()
-         response = requests.post(destination, files={'file': data})
-         if response.status_code == 200:
-             return True
-         else:
-             return False
+         with open(file_path, "rb") as f:
+             data = f.read()
+         response = requests.post(destination, files={"file": data})
+         success = response.status_code == 200
+         if success:
+             logger.info(f"Upload successful: {file_path}")
+         else:
+             logger.error(f"Upload failed: {file_path}, status={response.status_code}")
+         return success
      except Exception as e:
-         print(f"Error: {e}")
+         logger.exception(f"Upload error for {file_path}: {e}")
          return False
```
**问题：** 改了引号风格、加了类型提示、加了文档字符串、重排了空白、改了布尔逻辑

**✅ 正确做法（匹配现有风格）：**
```diff
+ import logging
+ logger = logging.getLogger(__name__)

  def upload_file(file_path, destination):
+     logger.info(f'Starting upload: {file_path}')
      try:
          with open(file_path, 'rb') as f:
              data = f.read()
          response = requests.post(destination, files={'file': data})
          if response.status_code == 200:
+             logger.info(f'Upload successful: {file_path}')
              return True
          else:
+             logger.error(f'Upload failed: {file_path}, status={response.status_code}')
              return False
      except Exception as e:
-         print(f"Error: {e}")
+         logger.exception(f'Upload error: {file_path}')
          return False
```
**匹配了：** 单引号、无类型提示、现有布尔模式、间距风格

### 示例 5：模糊 vs 可验证

**用户请求：** "修复认证系统"

**❌ 错误做法（模糊方法）：**
```
我会通过以下方式修复认证系统：
1. 审查代码
2. 识别问题
3. 进行改进
4. 测试更改

[在没有明确成功标准的情况下进行修改]
```

**✅ 正确做法（可验证目标）：**
```
要"修复认证"，我需要定义成功标准。
我们要解决的具体问题是什么？

如果问题是"用户修改密码后仍然保持登录状态"：

计划：
1. 编写测试：修改密码 → 验证旧会话被使无效
   验证：测试失败（复现 bug）

2. 实现：修改密码时使会话无效
   验证：测试通过

3. 检查边界情况：多个活跃会话、并发修改
   验证：额外测试通过

4. 验证无回归：现有认证测试仍通过
   验证：完整测试套件通过

当前认证测试覆盖率：[展示覆盖率]
你看到的具体认证问题是什么？
```

### 示例 6：测试优先验证

**用户请求：** "排序在有重复分数时出错"

**❌ 错误做法（未复现就修复）：**
```python
# 立即更改排序逻辑，未确认 bug
def sort_scores(scores):
    return sorted(scores, key=lambda x: (-x['score'], x['name']))
```

**✅ 正确做法（先复现）：**
```python
# 1. 首先，编写复现问题的测试
def test_sort_with_duplicate_scores():
    """Test sorting when multiple items have same score."""
    scores = [
        {'name': 'Alice', 'score': 100},
        {'name': 'Bob', 'score': 100},
        {'name': 'Charlie', 'score': 90},
    ]
    result = sort_scores(scores)
    # bug：重复项的排序是非确定性的
    # 多次运行此测试，结果应一致
    assert result[0]['score'] == 100
    assert result[1]['score'] == 100
    assert result[2]['score'] == 90

# 验证：运行测试 10 次 → 因排序不一致而失败

# 2. 现在用稳定排序修复
def sort_scores(scores):
    """Sort by score descending, then name ascending for ties."""
    return sorted(scores, key=lambda x: (-x['score'], x['name']))

# 验证：测试一致通过
```

---

## 项目定制

这些准则设计用于与项目特定指令合并。在现有 `SKILL.md` 或项目配置中添加：

```markdown
## 项目特定指南

- 使用 TypeScript 严格模式
- 所有 API 端点必须有测试
- 遵循 `src/utils/errors.ts` 中现有的错误处理模式
```

---

## 来源

- 原始仓库：[andrej-karpathy-skills](https://github.com/Hengli9986/andrej-karpathy-skills)
- 灵感来源：[Andrej Karpathy 的推文](https://x.com/karpathy/status/2015883857489522876)
- 许可证：MIT
