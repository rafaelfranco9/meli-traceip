
$( document ).ready(function() {
    requestAllStats();
    requestStats();
});

async function submit() {
  $('#loading').show();
  let ip = $('#ip').val();
  if (ip != '') {
    $('#error').text('');
    try {
      const response = await fetch(`http://localhost:5000/ip/${ip}`);
      const data = await response.json();
      if (data.statusCode != 404) {
        showData(data);
        requestStats();
        requestAllStats();
        $('#ip').val('');
      } else {
        $('#error').text('Ingresaste una IP invalida o no existente');
      }
    } catch (err) {
      $('#error').text('Error haciendo peticion');
      console.log(err);
    }
  } else {
    $('#error').text('Este campo no puede estar vacio');
  }
  $('#loading').hide();
}


function showData(data) {
  $('#info-ip').text(`IP: ${data.ip}`);
  $('#info-date').text(`Fecha actual: ${data.date}`);
  $('#info-country').text(
    `Nombre: ${data.country.spanishName} (${data.country.commonName})`,
  );
  $('#info-isoCode').text(`ISO Code: ${data.country.ISOcode}`);
  $('#info-language').text(
    `Idiomas: ${formatLanguage(data.country.languages)}`,
  );
  $('#info-currencies').text(
    `Moneda: ${formatCurrencies(data.country.currencies)}`,
  );
  $('#info-timezone').text(`Hora: ${formatTimezones(data.country.timezones)}`);
  $('#info-distance').text(
    `Distancia estimada: ${data.distance.distanceInKm} kms (${data.distance.from[0]},${data.distance.from[1]}) a (${data.distance.to[0]},${data.distance.to[1]})`,
  );
}

async function requestStats() {
  try {
    const response = await fetch('http://localhost:5000/statistics');
    const data = await response.json();
    if (data.statusCode != 404) {
      showStats(data);
    }
  } catch (err) {
    console.log(err);
    $('#stats').hide();
  }
}

function showStats(data) {
  $('#max-distance').text(`${data.maxDistance.distanceInKm} Kms`);
  $('#max-country').text(`(${data.maxDistance.name})`);
  $('#min-distance').text(`${data.minDistance.distanceInKm} Kms`);
  $('#min-country').text(`(${data.minDistance.name})`);
  $('#average-distance').text(`${data.averageDistanceInKm} Kms`);
  $('#stats').css('display', 'flex');
}

function createTable(data){
    if($('#table tbody').children().length > 0){
        $('#table tbody').children().remove();
    }
    Object.entries(data).forEach(([key,value]) => {
        $('#table tbody').append(`<tr><td>${value.name}</td><td>${value.distanceInKm}</td><td>${value.requests}</td></tr>`);
    });
}

async function requestAllStats() {
    try {
      const response = await fetch('http://localhost:5000/statistics/all');
      const data = await response.json();
      if (data.statusCode != 404) {
        createTable(data);
      }
    } catch (err) {
      console.log(err);
      $('#table').hide();
    }
  }

function formatLanguage(languages) {
  return Object.entries(languages).reduce((acc, [key, value], i) => {
    return (acc += `${i ? ', ' : ''}${value} (${key})`);
  }, '');
}

function formatCurrencies(currencies) {
  return currencies.reduce((acc, value, i) => {
    if (value.usdRate != 0) {
      return (acc += `${i ? ', ' : ''}${value.name} (1 ${value.code} = ${
        value.usdRate
      } U$S)`);
    } else {
      return (acc += `${i ? ', ' : ''}${value.name} (${value.code})`);
    }
  }, '');
}

function formatTimezones(timezones) {
  return timezones.reduce((acc, value, i) => {
    return (acc += `${i ? ' o ' : ''}${value.time} (${value.utcOverflow})`);
  }, '');
}
