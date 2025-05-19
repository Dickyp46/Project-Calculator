(() => {
  const expressionDisplay = document.getElementById('expression');
  const resultDisplay = document.getElementById('result');

  // State variables
  let currentInput = '0';
  let expression = '';
  let memory = 0;
  let lastResult = null;
  let powerMode = false; // For xʸ, user enters exponent after base
  let baseForPower = null;

  // Helper functions
  function updateDisplays() {
    expressionDisplay.textContent = expression;
    if (currentInput === '') {
      resultDisplay.textContent = '0';
    } else {
      resultDisplay.textContent = currentInput;
    }
  }

  function clearAll() {
    currentInput = '0';
    expression = '';
    powerMode = false;
    baseForPower = null;
    updateDisplays();
  }

  function clearEntry() {
    currentInput = '0';
    updateDisplays();
  }

  function appendInput(val) {
    if (powerMode) {
      // Entering exponent for x^y
      if (val === '.' && currentInput.includes('.')) return;
      if (currentInput === '0' && val !== '.') {
        currentInput = val;
      } else {
        currentInput += val;
      }
      updateDisplays();
      return;
    }
    // Normal input append
    if (val === '.') {
      if (!currentInput.includes('.')) {
        currentInput += '.';
      }
    } else if (val === '+/-') {
      if (currentInput.startsWith('-')) {
        currentInput = currentInput.slice(1);
      } else if (currentInput !== '0') {
        currentInput = '-' + currentInput;
      }
    } else {
      if (currentInput === '0') {
        currentInput = val;
      } else {
        currentInput += val;
      }
    }
    updateDisplays();
  }

  function addOperator(operator) {
    if (powerMode) {
      // Calculate power now
      if (currentInput === '' || baseForPower === null) return;
      const base = parseFloat(baseForPower);
      const exponent = parseFloat(currentInput);
      if (isNaN(exponent) || isNaN(base)) {
        clearAll();
        return;
      }
      const powerResult = Math.pow(base, exponent);
      currentInput = powerResult.toString();
      expression = '';
      powerMode = false;
      baseForPower = null;
      updateDisplays();
      return;
    }
    if (expression !== '' && /[+\-*/%]$/.test(expression)) {
      // Replace last operator if user inputs another operator consecutively
      expression = expression.slice(0, -1) + operator;
    } else {
      if (expression === '') {
        expression = currentInput + operator;
      } else {
        expression += currentInput + operator;
      }
    }
    currentInput = '';
    updateDisplays();
  }

  function calculateExpression() {
    if (powerMode) {
      // Calculate power now
      if (currentInput === '' || baseForPower === null) return;
      const base = parseFloat(baseForPower);
      const exponent = parseFloat(currentInput);
      if (isNaN(exponent) || isNaN(base)) {
        clearAll();
        return;
      }
      const powerResult = Math.pow(base, exponent);
      currentInput = powerResult.toString();
      expression = '';
      powerMode = false;
      baseForPower = null;
      updateDisplays();
      lastResult = parseFloat(currentInput);
      return;
    }

    if (expression === '' && currentInput === '') {
      currentInput = '0';
      updateDisplays();
      return;
    }

    let fullExpression = expression + currentInput;

    // Clean trailing operators
    fullExpression = fullExpression.replace(/[+\-*/%]+$/, '');

    // Convert % to calculation (e.g. 50% as 0.5)
    fullExpression = fullExpression.replace(/(\d+(\.\d+)?)%/g, '($1*0.01)');

    try {
      let evalResult = Function('"use strict";return (' + fullExpression + ')')();
      if (typeof evalResult === 'number' && !isNaN(evalResult) && isFinite(evalResult)) {
        lastResult = evalResult;
        currentInput = evalResult.toString();
        expression = '';
        updateDisplays();
      } else {
        throw new Error('Invalid calculation');
      }
    } catch (e) {
      currentInput = 'Error';
      expression = '';
      updateDisplays();
    }
  }

  function applyFunction(funcName) {
    let number = parseFloat(currentInput);
    if (isNaN(number)) return;

    let result = 0;
    const toRadians = (deg) => deg * (Math.PI / 180);
    const toDegrees = (rad) => rad * (180 / Math.PI);

    switch (funcName) {
      case 'sqrt':
        if (number < 0) {
          currentInput = 'Error';
          expression = '';
          updateDisplays();
          return;
        }
        result = Math.sqrt(number);
        break;
      case 'square':
        result = number * number;
        break;
      case 'reciprocal':
        if (number === 0) {
          currentInput = 'Error';
          expression = '';
          updateDisplays();
          return;
        }
        result = 1 / number;
        break;
      case 'sin':
        result = Math.sin(toRadians(number));
        break;
      case 'cos':
        result = Math.cos(toRadians(number));
        break;
      case 'tan':
        // Limit possibilities to avoid large numbers due to tan(90)
        let ang = number % 360;
        if (ang === 90 || ang === 270) {
          currentInput = 'Error';
          expression = '';
          updateDisplays();
          return;
        }
        result = Math.tan(toRadians(number));
        break;
      case 'asin':
        if (number < -1 || number > 1) {
          currentInput = 'Error';
          expression = '';
          updateDisplays();
          return;
        }
        result = toDegrees(Math.asin(number));
        break;
      case 'acos':
        if (number < -1 || number > 1) {
          currentInput = 'Error';
          expression = '';
          updateDisplays();
          return;
        }
        result = toDegrees(Math.acos(number));
        break;
      case 'atan':
        result = toDegrees(Math.atan(number));
        break;
      case 'power':
        // Prepare for power input after base
        baseForPower = currentInput;
        powerMode = true;
        currentInput = '';
        updateDisplays();
        return;
      default:
        return;
    }
    currentInput = result.toString();
    expression = '';
    updateDisplays();
  }

  // Memory functions
  function memoryClear() {
    memory = 0;
  }
  function memoryRecall() {
    currentInput = memory.toString();
    updateDisplays();
  }
  function memoryAdd() {
    const num = parseFloat(currentInput);
    if (!isNaN(num)) {
      memory += num;
    }
  }
  function memorySubtract() {
    const num = parseFloat(currentInput);
    if (!isNaN(num)) {
      memory -= num;
    }
  }

  // Attach event listeners
  document.querySelectorAll('.buttons button').forEach(button => {
    button.addEventListener('click', () => {
      const value = button.getAttribute('data-value');
      const action = button.getAttribute('data-action');

      if (action) {
        switch (action) {
          case 'clear':
            clearAll();
            break;
          case 'clear-entry':
            clearEntry();
            break;
          case 'calculate':
            calculateExpression();
            break;
          case 'sqrt':
          case 'square':
          case 'reciprocal':
          case 'sin':
          case 'cos':
          case 'tan':
          case 'asin':
          case 'acos':
          case 'atan':
          case 'power':
            applyFunction(action);
            break;
          case 'memory-clear':
            memoryClear();
            break;
          case 'memory-recall':
            memoryRecall();
            break;
          case 'memory-add':
            memoryAdd();
            break;
          case 'memory-subtract':
            memorySubtract();
            break;
          default:
            break;
        }
        return;
      }

      // For digits and operators
      if (value) {
        if ('0123456789.'.includes(value) || value === '+/-') {
          appendInput(value);
        } else if ('+-*/%'.includes(value)) {
          addOperator(value);
        }
      }
    });
  });

  // Initialize
  updateDisplays();

  // Keyboard support (optional, but helpful)
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
      appendInput(e.key);
      e.preventDefault();
    } else if (e.key === 'Enter' || e.key === '=') {
      calculateExpression();
      e.preventDefault();
    } else if (e.key === 'Backspace') {
      if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
      } else {
        currentInput = '0';
      }
      updateDisplays();
      e.preventDefault();
    } else if ('+-/*%'.includes(e.key)) {
      addOperator(e.key);
      e.preventDefault();
    } else if (e.key === 'Escape') {
      clearAll();
      e.preventDefault();
    }
  });
})();