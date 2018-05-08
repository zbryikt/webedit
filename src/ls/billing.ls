angular.module \webedit
  ..controller \billing, <[$scope $http $timeout ldNotify]> ++ ($scope, $http, $timeout, ldNotify) ->
    toUsd = (it) ->
      if !it or it.currency != \TWD => return
      guess = it.amount / 29
      if guess < 10 => usd = 9
      else if guess < 13 => usd = 12
      else if guess < 19 => usd = 18
      else usd = 24
      it.originalAmount = it{currency, amount}
      it <<< {currency: \USD, amount: usd}

    $scope.invoice = (if agreementInfo? => agreementInfo else {}).invoice or {}
    $scope.invoice-detail = (if invoiceData? => invoiceData else {})
    if $scope.invoice-detail => toUsd $scope.invoice-detail.payment

    $http do
      url: \/d/payment/
      method: \GET
    .then ->
      $scope.payments = it.data
      #TODO workaround: guess the USD amount if twd is billed
      $scope.payments.map -> toUsd it

    .catch -> $scope.payments = []
    if $scope.{}subscription.{}modal.invoice =>
      $scope.subscription.modal.invoice.{}payinfo <<< $scope.invoice

