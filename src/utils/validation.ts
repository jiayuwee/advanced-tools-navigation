/**
 * 数据验证工具类
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

export class Validator {
  private rules: Record<string, ValidationRule[]> = {};

  // 添加验证规则
  addRule(field: string, rule: ValidationRule): this {
    if (!this.rules[field]) {
      this.rules[field] = [];
    }
    this.rules[field].push(rule);
    return this;
  }

  // 验证数据
  validate(data: Record<string, any>): ValidationResult {
    const errors: Record<string, string[]> = {};

    for (const [field, rules] of Object.entries(this.rules)) {
      const value = data[field];
      const fieldErrors: string[] = [];

      for (const rule of rules) {
        const error = this.validateField(value, rule, field);
        if (error) {
          fieldErrors.push(error);
        }
      }

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // 验证单个字段
  private validateField(
    value: any,
    rule: ValidationRule,
    fieldName: string,
  ): string | null {
    // 必填验证
    if (
      rule.required &&
      (value === undefined || value === null || value === "")
    ) {
      return rule.message || `${fieldName}是必填项`;
    }

    // 如果值为空且不是必填，跳过其他验证
    if (value === undefined || value === null || value === "") {
      return null;
    }

    // 最小长度验证
    if (rule.minLength !== undefined && String(value).length < rule.minLength) {
      return rule.message || `${fieldName}最少需要${rule.minLength}个字符`;
    }

    // 最大长度验证
    if (rule.maxLength !== undefined && String(value).length > rule.maxLength) {
      return rule.message || `${fieldName}最多允许${rule.maxLength}个字符`;
    }

    // 正则表达式验证
    if (rule.pattern && !rule.pattern.test(String(value))) {
      return rule.message || `${fieldName}格式不正确`;
    }

    // 自定义验证
    if (rule.custom) {
      const result = rule.custom(value);
      if (result === false) {
        return rule.message || `${fieldName}验证失败`;
      }
      if (typeof result === "string") {
        return result;
      }
    }

    return null;
  }

  // 清空规则
  clear(): this {
    this.rules = {};
    return this;
  }
}

// 常用验证规则
export const ValidationRules = {
  // 邮箱验证
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "请输入有效的邮箱地址",
  },

  // 手机号验证
  phone: {
    pattern: /^1[3-9]\d{9}$/,
    message: "请输入有效的手机号码",
  },

  // 密码验证
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    message: "密码至少8位，包含大小写字母和数字",
  },

  // URL验证
  url: {
    pattern: /^https?:\/\/.+/,
    message: "请输入有效的URL地址",
  },

  // 用户名验证
  username: {
    pattern: /^[a-zA-Z0-9_]{3,20}$/,
    message: "用户名只能包含字母、数字和下划线，长度3-20位",
  },

  // 价格验证
  price: {
    pattern: /^\d+(\.\d{1,2})?$/,
    message: "请输入有效的价格",
  },

  // 正整数验证
  positiveInteger: {
    pattern: /^[1-9]\d*$/,
    message: "请输入正整数",
  },

  // 非负整数验证
  nonNegativeInteger: {
    pattern: /^(0|[1-9]\d*)$/,
    message: "请输入非负整数",
  },
};

// 表单验证器
export class FormValidator {
  private validators: Record<string, Validator> = {};

  // 创建表单验证器
  static create(): FormValidator {
    return new FormValidator();
  }

  // 添加字段验证
  field(name: string): FieldValidator {
    if (!this.validators[name]) {
      this.validators[name] = new Validator();
    }
    return new FieldValidator(this.validators[name]);
  }

  // 验证表单
  validate(data: Record<string, any>): ValidationResult {
    const allErrors: Record<string, string[]> = {};
    let isValid = true;

    for (const [field, validator] of Object.entries(this.validators)) {
      const result = validator.validate({ [field]: data[field] });
      if (!result.isValid) {
        isValid = false;
        Object.assign(allErrors, result.errors);
      }
    }

    return {
      isValid,
      errors: allErrors,
    };
  }

  // 验证单个字段
  validateField(fieldName: string, value: any): ValidationResult {
    const validator = this.validators[fieldName];
    if (!validator) {
      return { isValid: true, errors: {} };
    }

    return validator.validate({ [fieldName]: value });
  }
}

// 字段验证器
export class FieldValidator {
  constructor(private validator: Validator) {}

  // 必填
  required(message?: string): this {
    this.validator.addRule("field", { required: true, message });
    return this;
  }

  // 最小长度
  minLength(length: number, message?: string): this {
    this.validator.addRule("field", { minLength: length, message });
    return this;
  }

  // 最大长度
  maxLength(length: number, message?: string): this {
    this.validator.addRule("field", { maxLength: length, message });
    return this;
  }

  // 正则表达式
  pattern(regex: RegExp, message?: string): this {
    this.validator.addRule("field", { pattern: regex, message });
    return this;
  }

  // 邮箱
  email(message?: string): this {
    this.validator.addRule("field", { ...ValidationRules.email, message });
    return this;
  }

  // 手机号
  phone(message?: string): this {
    this.validator.addRule("field", { ...ValidationRules.phone, message });
    return this;
  }

  // 密码
  password(message?: string): this {
    this.validator.addRule("field", { ...ValidationRules.password, message });
    return this;
  }

  // URL
  url(message?: string): this {
    this.validator.addRule("field", { ...ValidationRules.url, message });
    return this;
  }

  // 用户名
  username(message?: string): this {
    this.validator.addRule("field", { ...ValidationRules.username, message });
    return this;
  }

  // 价格
  price(message?: string): this {
    this.validator.addRule("field", { ...ValidationRules.price, message });
    return this;
  }

  // 自定义验证
  custom(validator: (value: any) => boolean | string, message?: string): this {
    this.validator.addRule("field", { custom: validator, message });
    return this;
  }
}

// 快速验证函数
export const validate = {
  email: (value: string): boolean => ValidationRules.email.pattern.test(value),
  phone: (value: string): boolean => ValidationRules.phone.pattern.test(value),
  url: (value: string): boolean => ValidationRules.url.pattern.test(value),
  username: (value: string): boolean =>
    ValidationRules.username.pattern.test(value),
  price: (value: string): boolean => ValidationRules.price.pattern.test(value),

  // 密码强度检查
  passwordStrength: (
    password: string,
  ): { score: number; feedback: string[] } => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    else feedback.push("密码至少需要8个字符");

    if (/[a-z]/.test(password)) score++;
    else feedback.push("需要包含小写字母");

    if (/[A-Z]/.test(password)) score++;
    else feedback.push("需要包含大写字母");

    if (/\d/.test(password)) score++;
    else feedback.push("需要包含数字");

    if (/[^a-zA-Z\d]/.test(password)) score++;
    else feedback.push("建议包含特殊字符");

    return { score, feedback };
  },

  // 确认密码
  confirmPassword: (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword;
  },
};
