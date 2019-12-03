(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

    const BASE_PRICE = 15;
// const URL = "https://script.google.com/macros/s/AKfycbwnOTv_-kFISLa-3S-vkEqZscgrmptlf9nAP6o7O8vQm6exnvg/exec";
const URL = "https://script.google.com/macros/s/AKfycbwnOTv_-kFISLa-3S-vkEqZscgrmptlf9nAP6o7O8vQm6exnvg/dev";
const EXCHANGE = {'GBP': 1.13};
document.addEventListener("DOMContentLoaded", function(event) { 
//   Когда страница загрузилась
  let form = document.querySelector('#mainForm')
  
//   Повесим на все обязательные элементы формы состояние заполнено после того как данные в поле были внесены
  let requiredInputs = document.querySelectorAll('input')
  requiredInputs.forEach(function(elem){
    ['change', 'blur', 'keydown'].forEach(function(e) {
      elem.addEventListener(e, function(){
        this.setAttribute('filled', true);
      });
});
   });
  
//   Обработчики выбора страны
  var checkboxes = document.querySelectorAll('[data-form-elem="country-selector"] input[type="checkbox"]');
  checkboxes.forEach(function(elem){
    elem.addEventListener('change', function(e){
      var country_block = document.querySelector('[data-form-elem="country-block"][data-country="'+this.value+'"]')
      var inputs = country_block.querySelectorAll('input');
      if (country_block.hidden) {
        country_block.removeAttribute('hidden')
        country_block.setAttribute('active', '');
        inputs.forEach(function(elem){elem.setAttribute('required','')})
      } else {
        country_block.setAttribute('hidden', '');
        country_block.removeAttribute('active');
        inputs.forEach(function(elem){elem.removeAttribute('required')})
      }
    })
  });
  
//   Обработчики запуска калькуляции
  let triggers = document.querySelectorAll('[data-form-elem="price"], [data-form-elem="reviews"]')
  triggers.forEach(function(elem){
    elem.addEventListener('change', calculate)
  });
  
  
  let blocks = document.querySelectorAll('[data-form-elem="country-block"]'); 
  const observer = new MutationObserver(function(mutationsList, observer){
    for (let mutation of mutationsList) {if (mutation.attributeName == 'active'){calculate()}}
  })
  blocks.forEach(function(block){
    observer.observe(block, {attributes: true})
  })

//   Обработчик отправки формы
  form.querySelector('input[type="submit"]').addEventListener('click', function(e){
    var resultDiv = document.querySelector('#form-result')
    resultDiv.classList.remove('success')
    var isValid = this.form.checkValidity();
    if (!isValid) {
      return     
    }

    e.preventDefault();
    var survey = {};
    let formData = new FormData(form);
    
    let states = [];
    form.querySelectorAll('[active][data-form-elem="country-block"]').forEach(function(elem){
      states.push(elem.dataset.country);
    });
  
    form.querySelectorAll(':not([active])[data-form-elem="country-block"]').forEach(function(elem){
      ['link', 'keyword', 'page', 'price', 'reviews', 'quantity'].forEach(function(item){
        formData.delete(elem.dataset.country + '_' + item)
      })
    })
    
//     Костыль чтобы пересчитать коэфицциенты обмена
    form.querySelectorAll('[data-form-elem="country-block"][active]').forEach(function(elem){
      let price = elem.querySelector('[data-form-elem="price"]');
      let priceLocal = price.value;
      let currency = price.dataset.currency
      let newPrice = Math.round((currency == 'EUR' ? priceLocal : priceLocal * EXCHANGE[currency]) * 100) /100;
      formData.set(elem.dataset.country + '_price', newPrice);
      
    });
    formData.forEach((value, key) => {survey[key] = value});
    survey.States = states;
    
    //     Сконвертируем нужные поля в int или float
    form.querySelectorAll('input[type="number"]').forEach(function(elem){
      if (elem.name in survey) {
        survey[elem.name] = elem.getAttribute('step')=='0.01' ? parseFloat(survey[elem.name]) : parseInt(survey[elem.name])
      }
    })   

    
    var data = JSON.stringify({"task": 'addRecord', "request": survey});
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
    if (request.readyState == XMLHttpRequest.DONE) {
        console.log(request.responseText);
        resultDiv.classList.add('success')
    }
}
    request.open("POST", URL, true);
    request.send(data);
  })
});

function calculate() {
  let sum = 0;
  var country_blocks = document.querySelectorAll('[data-form-elem="country-block"][active]')
  country_blocks.forEach(function(block){
    let price = block.querySelector('[data-form-elem="price"]');
    let priceLocal = parseFloat(price.value);
    let priceEURO = Math.round((price.dataset.currency == 'EUR' ? priceLocal : priceLocal * EXCHANGE[price.dataset.currency]) * 100) / 100;
    let review = parseInt(block.querySelector('[data-form-elem="reviews"]').value)
    sum += (priceEURO + BASE_PRICE) * review;
  })
  document.querySelector('#total').innerHTML = sum.toLocaleString(2);
}

$('#form-result .bg').click(function(){
  $(this).parent().hide();
});

$('#form-result .modal a.btnMcl').click(function(){
  $(this).parent().parent().hide();
});






},{}]},{},[1]);
