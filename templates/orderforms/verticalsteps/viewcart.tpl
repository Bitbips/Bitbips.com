<link rel="stylesheet" type="text/css" href="templates/orderforms/{$carttpl}/style.css" />
<script type="text/javascript" src="includes/jscript/statesdropdown.js"></script>
<script type="text/javascript" src="includes/jscript/pwstrength.js"></script>
<script type="text/javascript" src="includes/jscript/creditcard.js"></script>

{literal}
<script language="javascript">
function removeItem(type,num) {
    var response = confirm("{/literal}{$LANG.cartremoveitemconfirm}{literal}");
    if (response) {
        window.location = 'cart.php?a=remove&r='+type+'&i='+num;
    }
}
function emptyCart(type,num) {
    var response = confirm("{/literal}{$LANG.cartemptyconfirm}{literal}");
    if (response) {
        window.location = 'cart.php?a=empty';
    }
}
</script>
{/literal}
<script>
window.langPasswordStrength = "{$LANG.pwstrength}";
window.langPasswordWeak = "{$LANG.pwstrengthweak}";
window.langPasswordModerate = "{$LANG.pwstrengthmoderate}";
window.langPasswordStrong = "{$LANG.pwstrengthstrong}";
</script>

<div id="order-verticalsteps">

{if $checkout}
{include file="orderforms/verticalsteps/verticalsteps.tpl" step=5}
{else}
{include file="orderforms/verticalsteps/verticalsteps.tpl" step=4}
{/if}

<div class="maincontent">

{if !$checkout}

<h1>{$LANG.ordersummary}</h1>

{if $errormessage}<div class="errorbox">{$errormessage|replace:'<li>':' &nbsp;#&nbsp; '} &nbsp;#&nbsp; </div>{elseif $promotioncode && $rawdiscount eq "0.00"}<div class="errorbox">{$LANG.promoappliedbutnodiscount}</div>{/if}

{if $bundlewarnings}
<div class="errorbox" style="display:block;">
<strong>{$LANG.bundlereqsnotmet}</strong><br />
{foreach from=$bundlewarnings item=warning}
{$warning}<br />
{/foreach}
</div>
{/if}

<form method="post" action="{$smarty.server.PHP_SELF}?a=view">

<table class="styled">
<tr class="textcenter"><th width="70%">{$LANG.orderdesc}</th><th width="30%">{$LANG.orderprice}</th></tr>

{foreach key=num item=product from=$products}
<tr><td>
<strong><em>{$product.productinfo.groupname}</em> - {$product.productinfo.name}</strong>{if $product.domain} ({$product.domain}){/if}<br />
{if $product.configoptions}
{foreach key=confnum item=configoption from=$product.configoptions}&nbsp;&raquo; {$configoption.name}: {if $configoption.type eq 1 || $configoption.type eq 2}{$configoption.option}{elseif $configoption.type eq 3}{if $configoption.qty}{$LANG.yes}{else}{$LANG.no}{/if}{elseif $configoption.type eq 4}{$configoption.qty} x {$configoption.option}{/if}<br />{/foreach}
{/if}
<a href="{$smarty.server.PHP_SELF}?a=confproduct&i={$num}" class="cartedit">[{$LANG.carteditproductconfig}]</a> <a href="#" onclick="removeItem('p','{$num}');return false" class="cartremove">[{$LANG.cartremove}]</a>
{if $product.allowqty}
<br /><br />
<div align="right">{$LANG.cartqtyenterquantity} <input type="text" name="qty[{$num}]" size="3" value="{$product.qty}" /> <input type="submit" value="{$LANG.cartqtyupdate}" /></div>
{/if}
</td><td class="textcenter"><strong>{$product.pricingtext}{if $product.proratadate}<br />({$LANG.orderprorata} {$product.proratadate}){/if}</strong></td></tr>
{foreach key=addonnum item=addon from=$product.addons}
<tr class="carttableproduct"><td> &nbsp;&nbsp; <strong>{$LANG.orderaddon}</strong> - {$addon.name}</td><td class="textcenter"><strong>{$addon.pricingtext}</strong></td></tr>
{/foreach}
{/foreach}

{foreach key=num item=addon from=$addons}
<tr><td>
<strong>{$addon.name}</strong><br />
{$addon.productname}{if $addon.domainname} - {$addon.domainname}<br />{/if}
<a href="#" onclick="removeItem('a','{$num}');return false" class="cartremove">[{$LANG.cartremove}]</a>
</td><td class="textcenter"><strong>{$addon.pricingtext}</strong></td></tr>
{/foreach}

{foreach key=num item=domain from=$domains}
<tr><td>
<strong>{if $domain.type eq "register"}{$LANG.orderdomainregistration}{else}{$LANG.orderdomaintransfer}{/if}</strong> - {$domain.domain} - {$domain.regperiod} {$LANG.orderyears}<br />
{if $domain.dnsmanagement}&nbsp;&raquo; {$LANG.domaindnsmanagement}<br />{/if}
{if $domain.emailforwarding}&nbsp;&raquo; {$LANG.domainemailforwarding}<br />{/if}
{if $domain.idprotection}&nbsp;&raquo; {$LANG.domainidprotection}<br />{/if}
<a href="{$smarty.server.PHP_SELF}?a=confdomains" class="cartedit">[{$LANG.cartconfigdomainextras}]</a> <a href="#" onclick="removeItem('d','{$num}');return false" class="cartremove">[{$LANG.cartremove}]</a>
</td><td class="textcenter"><strong>{$domain.price}</strong></td></tr>
{/foreach}

{foreach key=num item=domain from=$renewals}
<tr><td>
<strong>{$LANG.domainrenewal}</strong> - {$domain.domain} - {$domain.regperiod} {$LANG.orderyears}<br />
{if $domain.dnsmanagement}&nbsp;&raquo; {$LANG.domaindnsmanagement}<br />{/if}
{if $domain.emailforwarding}&nbsp;&raquo; {$LANG.domainemailforwarding}<br />{/if}
{if $domain.idprotection}&nbsp;&raquo; {$LANG.domainidprotection}<br />{/if}
<a href="#" onclick="removeItem('r','{$num}');return false" class="cartremove">[{$LANG.cartremove}]</a>
</td><td class="textcenter"><strong>{$domain.price}</strong></td></tr>
{/foreach}

{if $cartitems==0}
<tr><td colspan="2" class="textcenter">
<br />
{$LANG.cartempty}
<br /><br />
</td></tr>
{/if}

</table>

</form>

<form method="post" action="{$smarty.server.PHP_SELF}?a=view">
<input type="hidden" name="validatepromo" value="true" />
<p align="center"><strong>{$LANG.orderpromotioncode}:</strong> {if $promotioncode}{$promotioncode} - {$promotiondescription}<br /><a href="{$smarty.server.PHP_SELF}?a=removepromo">{$LANG.orderdontusepromo}</a>{else}<input type="text" name="promocode" size="20" /> <input type="submit" value="{$LANG.orderpromovalidatebutton}" />{/if}
</form>

<p align="center">
{$LANG.ordersubtotal}: <b>{$subtotal}</b><br />
{if $promotioncode}{$promotiondescription}: <b>{$discount}</b><br />{/if}
{if $taxrate}{$taxname} @ {$taxrate}%: <b>{$taxtotal}</b><br />{/if}
{if $taxrate2}{$taxname2} @ {$taxrate2}%: <b>{$taxtotal2}</b><br />{/if}
{$LANG.ordertotalduetoday}: <b>{$total}</b><br />
{if $totalrecurringmonthly || $totalrecurringquarterly || $totalrecurringsemiannually || $totalrecurringannually || $totalrecurringbiennially || $totalrecurringtriennially}
{$LANG.ordertotalrecurring}: <b>{if $totalrecurringmonthly}{$totalrecurringmonthly} {$LANG.orderpaymenttermmonthly}<br />{/if}
{if $totalrecurringquarterly}{$totalrecurringquarterly} {$LANG.orderpaymenttermquarterly}<br />{/if}
{if $totalrecurringsemiannually}{$totalrecurringsemiannually} {$LANG.orderpaymenttermsemiannually}<br />{/if}
{if $totalrecurringannually}{$totalrecurringannually} {$LANG.orderpaymenttermannually}<br />{/if}
{if $totalrecurringbiennially}{$totalrecurringbiennially} {$LANG.orderpaymenttermbiennially}<br />{/if}
{if $totalrecurringtriennially}{$totalrecurringtriennially} {$LANG.orderpaymenttermtriennially}<br />{/if}</b>
{/if}
</p>

<p align="center"><input type="button" value="&laquo; {$LANG.orderstartover}" onclick="window.location='cart.php?a=startover'" /> <input type="button" value="{$LANG.checkout} &raquo;" onclick="window.location='cart.php?a=checkout'"{if $cartitems==0} disabled{/if} /></p>

{foreach from=$gatewaysoutput item=gatewayoutput}
<div class="gateway"><strong>- {$LANG.or} -</strong><br /><br />{$gatewayoutput}</div>
{/foreach}

{else}

{literal}<script language="javascript">
function showloginform() {
    jQuery("#loginfrm").slideToggle();
    jQuery("#mainfrm").slideToggle();
}
function domaincontactchange() {
    if (jQuery("#domaincontact").val()=="addingnew") {
        jQuery("#domaincontactfields").slideDown();
    } else {
        jQuery("#domaincontactfields").slideUp();
    }
}
function showCCForm() {
    jQuery("#ccinputform").slideDown();
}
function hideCCForm() {
    jQuery("#ccinputform").slideUp();
}
function useExistingCC() {
    jQuery(".newccinfo").hide();
}
function enterNewCC() {
    jQuery(".newccinfo").show();
}
</script>{/literal}

<p class="ordertotal">{$LANG.ordertotalduetoday}: <strong>{$total}</strong></p>

<h1>{$LANG.checkout}</h1>

{if $errormessage}<div class="errorbox">{$errormessage|replace:'<li>':' &nbsp;#&nbsp; '} &nbsp;#&nbsp; </div>{/if}

<h2>{$LANG.yourdetails}</h2>
{if !$loggedin}<p align="center"><b>{$LANG.alreadyregistered} <a href="{$smarty.server.PHP_SELF}?a=login" onclick="showloginform();return false;">{$LANG.clickheretologin}</a></b></p>{/if}

<form action="dologin.php" method="post">
<div id="loginfrm" style="display:none;">
<table align="center">
<tr><td class="fieldarea" align="right">{$LANG.loginemail}:</td><td><input type="text" name="username" size="40" value="{$username}" /></td></tr>
<tr><td class="fieldarea" align="right">{$LANG.loginpassword}:</td><td><input type="password" name="password" size="25" /></td></tr>
</table>
<p align="center"><input type="submit" value="{$LANG.loginbutton}" /></p>
</div>
</form>

<form method="post" action="{$smarty.server.PHP_SELF}?a=checkout" id="mainfrm">
<input type="hidden" name="submit" value="true" />

<table cellspacing="1" cellpadding="0"><tr><td width="48%" valign="top">

<table width="100%" cellpadding="2">
<tr><td width="85">{$LANG.clientareafirstname}</td><td>{if $loggedin}{$clientsdetails.firstname}{else}<input type="text" name="firstname" style="width:80%;" value="{$clientsdetails.firstname}" />{/if}</td></tr>
<tr><td>{$LANG.clientarealastname}</td><td>{if $loggedin}{$clientsdetails.lastname}{else}<input type="text" name="lastname" style="width:80%;" value="{$clientsdetails.lastname}" />{/if}</td></tr>
<tr><td>{$LANG.clientareacompanyname}</td><td>{if $loggedin}{$clientsdetails.companyname}{else}<input type="text" name="companyname" style="width:80%;" value="{$clientsdetails.companyname}" />{/if}</td></tr>
<tr><td{if !$loggedin} style="height:21px;"{/if}><br /></td><td></td></tr>
<tr><td>{$LANG.clientareaemail}</td><td>{if $loggedin}{$clientsdetails.email}{else}<input type="text" name="email" style="width:80%;" value="{$clientsdetails.email}" />{/if}</td></tr>
{if $loggedin}
<tr><td><br /></td><td></td></tr>
<tr><td><br /></td><td></td></tr>
{else}
<tr><td>{$LANG.clientareapassword}</td><td><input type="password" name="password" id="newpw" size="20" value="{$password}" /></td></tr>
<tr><td>{$LANG.clientareaconfirmpassword}</td><td><input type="password" name="password2" size="20" value="{$password2}" /></td></tr>
{/if}
</table>

</td><td width="48%" valign="top">

<table width="100%" cellpadding="2">
<tr><td width="85">{$LANG.clientareaaddress1}</td><td>{if $loggedin}{$clientsdetails.address1}{else}<input type="text" name="address1" style="width:80%;" value="{$clientsdetails.address1}" />{/if}</td></tr>
<tr><td>{$LANG.clientareaaddress2}</td><td>{if $loggedin}{$clientsdetails.address2}{else}<input type="text" name="address2" style="width:80%;" value="{$clientsdetails.address2}" />{/if}</td></tr>
<tr><td>{$LANG.clientareacity}</td><td>{if $loggedin}{$clientsdetails.city}{else}<input type="text" name="city" style="width:80%;" value="{$clientsdetails.city}" />{/if}</td></tr>
<tr><td>{$LANG.clientareastate}</td><td>{if $loggedin}{$clientsdetails.state}{else}<input type="text" name="state" style="width:130px;" value="{$clientsdetails.state}" />{/if}</td></tr>
<tr><td>{$LANG.clientareapostcode}</td><td>{if $loggedin}{$clientsdetails.postcode}{else}<input type="text" name="postcode" style="width:80%;" size="15" value="{$clientsdetails.postcode}" />{/if}</td></tr>
<tr><td>{$LANG.clientareacountry}</td><td>{if $loggedin}{$clientsdetails.country}{else}{$clientcountrydropdown|replace:'name="country"':'name="country" style="width:130px;"'|replace:'United States Outlying Islands':'US Outlying Islands'}{/if}</td></tr>
<tr><td>{$LANG.clientareaphonenumber}</td><td>{if $loggedin}{$clientsdetails.phonenumber}{else}<input type="text" name="phonenumber" style="width:80%;" size="20" value="{$clientsdetails.phonenumber}" />{/if}</td></tr>
</table>

</td></tr></table>

{if !$loggedin}<p align="center"><script language="javascript">showStrengthBar();</script></p>{/if}

{if !$loggedin && ($customfields || $securityquestions)}
<table width="100%" cellpadding="2">
{if $securityquestions && !$loggedin}
<tr><td width="200">{$LANG.clientareasecurityquestion}</td><td><select name="securityqid">
{foreach key=num item=question from=$securityquestions}
    <option value="{$question.id}"{if $question.id eq $securityqid} selected{/if}>{$question.question}</option>
{/foreach}
</select></td></tr>
<tr><td>{$LANG.clientareasecurityanswer}</td><td><input type="password" name="securityqans" value="{$securityqans}" size="30"></td></tr>
{/if}
{foreach key=num item=customfield from=$customfields}
<tr><td width="200">{$customfield.name}</td><td>{$customfield.input} {$customfield.description}</td></tr>
{/foreach}
</table>
{/if}

{if $domainsinorder}
<h2>{$LANG.domainregistrantinfo}</h2>

<p>{$LANG.domainregistrantchoose}: <select name="contact" id="domaincontact" onchange="domaincontactchange()">
    <option value="">{$LANG.usedefaultcontact}</option>
{foreach from=$domaincontacts item=domcontact}
    <option value="{$domcontact.id}"{if $contact==$domcontact.id} selected{/if}>{$domcontact.name}</option>
{/foreach}
    <option value="addingnew"{if $contact eq "addingnew"} selected{/if}>{$LANG.clientareanavaddcontact}...</option>
</select><br /></p>

<div id="domaincontactfields"{if $contact neq "addingnew"} class="hidden"{/if}>
<table cellspacing="1" cellpadding="0"><tr><td width="50%" valign="top">
<table width="100%" cellpadding="2">
<tr><td width="100">{$LANG.clientareafirstname}</td><td><input type="text" name="domaincontactfirstname" style="width:80%;" value="{$domaincontact.firstname}" /></td></tr>
<tr><td>{$LANG.clientarealastname}</td><td><input type="text" name="domaincontactlastname" style="width:80%;" value="{$domaincontact.lastname}" /></td></tr>
<tr><td>{$LANG.clientareacompanyname}</td><td><input type="text" name="domaincontactcompanyname" style="width:80%;" value="{$domaincontact.companyname}" /></td></tr>
<tr><td style="height:21px;"><br /></td><td></td></tr>
<tr><td>{$LANG.clientareaemail}</td><td><input type="text" name="domaincontactemail" style="width:90%;" value="{$domaincontact.email}" /></td></tr>
<tr><td>{$LANG.clientareaphonenumber}</td><td><input type="text" name="domaincontactphonenumber" size="20" value="{$domaincontact.phonenumber}" /></td></tr>
</table>
</td><td width="50%" valign="top">
<table width="100%" cellpadding="2">
<tr><td width="100">{$LANG.clientareaaddress1}</td><td><input type="text" name="domaincontactaddress1" style="width:80%;" value="{$domaincontact.address1}" /></td></tr>
<tr><td>{$LANG.clientareaaddress2}</td><td><input type="text" name="domaincontactaddress2" style="width:80%;" value="{$domaincontact.address2}" /></td></tr>
<tr><td>{$LANG.clientareacity}</td><td><input type="text" name="domaincontactcity" style="width:80%;" value="{$domaincontact.city}" /></td></tr>
<tr><td>{$LANG.clientareastate}</td><td><input type="text" name="domaincontactstate" style="width:80%;" value="{$domaincontact.state}" /></td></tr>
<tr><td>{$LANG.clientareapostcode}</td><td><input type="text" name="domaincontactpostcode" size="15" value="{$domaincontact.postcode}" /></td></tr>
<tr><td>{$LANG.clientareacountry}</td><td>{$domaincontactcountrydropdown|replace:'name="domaincontactcountry"':'name="domaincontactcountry" style="width:150px;"'|replace:'United States Outlying Islands':'US Outlying Islands'}</td></tr>
</table>
</td></tr></table>
</div>

{/if}

<h2>{$LANG.orderpaymentmethod}</h2>
<p align="center">{foreach key=num item=gateway from=$gateways}<input type="radio" name="paymentmethod" value="{$gateway.sysname}" id="pgbtn{$num}" onclick="{if $gateway.type eq "CC"}showCCForm(){else}hideCCForm(){/if}"{if $selectedgateway eq $gateway.sysname} checked{/if} /><label for="pgbtn{$num}"><img src="images/paymentmethod/{$gateway.sysname}.jpg" alt="{$gateway.name}" width="88" height="31" border="0" align="absmiddle"></label> {/foreach}</p>

<div id="ccinputform"{if $selectedgatewaytype neq "CC"} style="display:none;"{/if}>
<table width="100%" cellpadding="2">
{if $clientsdetails.cclastfour}<tr><td width="150"></td><td><input type="radio" name="ccinfo" value="useexisting" id="useexisting" onclick="useExistingCC()"{if $clientsdetails.cclastfour} checked{else} disabled{/if} /> <label for="useexisting">{$LANG.creditcarduseexisting}{if $clientsdetails.cclastfour} ({$clientsdetails.cclastfour}){/if}</label><br />
<input type="radio" name="ccinfo" value="new" id="new" onclick="enterNewCC()"{if !$clientsdetails.cclastfour || $ccinfo eq "new"} checked{/if} /> <label for="new">{$LANG.creditcardenternewcard}</label></td></tr>{else}<input type="hidden" name="ccinfo" value="new" />{/if}
<tr class="newccinfo"{if $clientsdetails.cclastfour && $ccinfo neq "new"} style="display:none;"{/if}><td width="150">{$LANG.creditcardcardtype}</td><td><select name="cctype" id="cctype">
{foreach key=num item=cardtype from=$acceptedcctypes}
<option{if $cctype eq $cardtype} selected{/if}>{$cardtype}</option>
{/foreach}
</select></td></tr>
<tr class="newccinfo"{if $clientsdetails.cclastfour && $ccinfo neq "new"} style="display:none;"{/if}><td>{$LANG.creditcardcardnumber}</td><td><input type="text" name="ccnumber" size="30" value="{$ccnumber}" autocomplete="off" /></td></tr>
<tr class="newccinfo"{if $clientsdetails.cclastfour && $ccinfo neq "new"} style="display:none;"{/if}><td>{$LANG.creditcardcardexpires}</td><td><select name="ccexpirymonth" id="ccexpirymonth" class="newccinfo">
{foreach from=$months item=month}
<option{if $ccexpirymonth eq $month} selected{/if}>{$month}</option>
{/foreach}</select> / <select name="ccexpiryyear" class="newccinfo">
{foreach from=$expiryyears item=year}
<option{if $ccexpiryyear eq $year} selected{/if}>{$year}</option>
{/foreach}
</select></td></tr>
{if $showccissuestart}
<tr class="newccinfo"{if $clientsdetails.cclastfour && $ccinfo neq "new"} style="display:none;"{/if}><td>{$LANG.creditcardcardstart}</td><td><select name="ccstartmonth" id="ccstartmonth" class="newccinfo">
{foreach from=$months item=month}
<option{if $ccstartmonth eq $month} selected{/if}>{$month}</option>
{/foreach}</select> / <select name="ccstartyear" class="newccinfo">
{foreach from=$startyears item=year}
<option{if $ccstartyear eq $year} selected{/if}>{$year}</option>
{/foreach}
</select></td></tr>
<tr class="newccinfo"{if $clientsdetails.cclastfour && $ccinfo neq "new"} style="display:none;"{/if}><td>{$LANG.creditcardcardissuenum}</td><td><input type="text" name="ccissuenum" value="{$ccissuenum}" size="5" maxlength="3" /></td></tr>
{/if}
<tr><td>{$LANG.creditcardcvvnumber}</td><td><input type="text" name="cccvv" id="cccvv" value="{$cccvv}" size="5" autocomplete="off" /> <a href="#" onclick="window.open('images/ccv.gif','','width=280,height=200,scrollbars=no,top=100,left=100');return false">{$LANG.creditcardcvvwhere}</a></td></tr>
{if $shownostore}<tr><td>&nbsp;</td><td><label><input type="checkbox" name="nostore" /> {$LANG.creditcardnostore}</label></td></tr>{/if}
</table>
</div>

{if $shownotesfield}
<h2>{$LANG.ordernotes}</h2>
<p align="center"><textarea name="notes" rows="4" style="width:75%" onFocus="if(this.value=='{$LANG.ordernotesdescription}'){ldelim}this.value='';{rdelim}" onBlur="if (this.value==''){ldelim}this.value='{$LANG.ordernotesdescription}';{rdelim}">{$notes}</textarea></p>
{/if}

{if $accepttos}
<p align="center"><input type="checkbox" name="accepttos" id="accepttos" /> <label for="accepttos">{$LANG.ordertosagreement} <a href="{$tosurl}" target="_blank">{$LANG.ordertos}</a></label><p>
{/if}

<p align="center"><input type="submit" value="{$LANG.completeorder} &raquo;"{if $cartitems==0} disabled{/if} onclick="this.value='{$LANG.pleasewait}'" /></p>

<br />

<p><img align="left" src="images/padlock.gif" border="0" vspace="5" alt="Secure Transaction" style="padding-right: 10px;" /> {$LANG.ordersecure} (<strong>{$ipaddress}</strong>) {$LANG.ordersecure2}</p>

</form>

{/if}

</div>

</div>
