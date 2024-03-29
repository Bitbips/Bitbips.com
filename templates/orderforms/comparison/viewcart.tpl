<script type="text/javascript" src="includes/jscript/jqueryui.js"></script>
<script type="text/javascript" src="templates/orderforms/{$carttpl}/js/main.js"></script>
<script type="text/javascript" src="includes/jscript/statesdropdown.js"></script>
<script type="text/javascript" src="includes/jscript/pwstrength.js"></script>
<script type="text/javascript" src="includes/jscript/creditcard.js"></script>

<link rel="stylesheet" type="text/css" href="templates/orderforms/{$carttpl}/style.css" />
<link rel="stylesheet" type="text/css" href="templates/orderforms/{$carttpl}/uistyle.css" />

{literal}<script language="javascript">
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
</script>{/literal}
<script>
window.langPasswordStrength = "{$LANG.pwstrength}";
window.langPasswordWeak = "{$LANG.pwstrengthweak}";
window.langPasswordModerate = "{$LANG.pwstrengthmoderate}";
window.langPasswordStrong = "{$LANG.pwstrengthstrong}";
</script>

<div id="order-comparison">

{include file="orderforms/comparison/comparisonsteps.tpl" step=3}

<div class="cartcontainer">

{if $errormessage}<div class="errorbox">{$LANG.clientareaerrors}<ul>{$errormessage}</ul></div>{elseif $promotioncode && $rawdiscount eq "0.00"}<div class="errorbox">{$LANG.promoappliedbutnodiscount}</div>{/if}

{if $bundlewarnings}
<div class="errorbox">
<strong>{$LANG.bundlereqsnotmet}</strong><br />
{foreach from=$bundlewarnings item=warning}
{$warning}<br />
{/foreach}
</div>
{/if}

<h2>{$LANG.ordersummary|strtolower}</h2>

<form method="post" action="{$smarty.server.PHP_SELF}?a=view">

<table class="carttable">
<tr class="carttableheading"><th width="70%">{$LANG.orderdesc}</th><th width="30%">{$LANG.orderprice}</th></tr>

{foreach key=num item=product from=$products}
<tr class="carttableproduct"><td>
<strong><em>{$product.productinfo.groupname}</em> - {$product.productinfo.name}</strong>{if $product.domain} ({$product.domain}){/if}<br />
{if $product.configoptions}
{foreach key=confnum item=configoption from=$product.configoptions}&nbsp;&raquo; {$configoption.name}: {if $configoption.type eq 1 || $configoption.type eq 2}{$configoption.option}{elseif $configoption.type eq 3}{if $configoption.qty}{$LANG.yes}{else}{$LANG.no}{/if}{elseif $configoption.type eq 4}{$configoption.qty} x {$configoption.option}{/if}<br />{/foreach}
{/if}
<a href="{$smarty.server.PHP_SELF}?a=confproduct&i={$num}" class="cartedit">[{$LANG.carteditproductconfig}]</a> <a href="#" onclick="removeItem('p','{$num}');return false" class="cartremove">[{$LANG.cartremove}]</a>
{if $product.allowqty}
<div align="right">{$LANG.quantity}: <input type="text" name="qty[{$num}]" size="3" value="{$product.qty}" /> <input type="submit" value="{$LANG.cartqtyupdate}" /></div>
{/if}
</td><td class="textcenter"><strong>{$product.pricingtext}{if $product.proratadate}<br />({$LANG.orderprorata} {$product.proratadate}){/if}</strong></td></tr>
{foreach key=addonnum item=addon from=$product.addons}
<tr class="carttableproduct"><td><strong>{$LANG.orderaddon}</strong> - {$addon.name}</td><td align="center"><strong>{$addon.pricingtext}</strong></td></tr>
{/foreach}
{/foreach}

{foreach key=num item=addon from=$addons}
<tr class="carttableproduct"><td>
<strong>{$addon.name}</strong><br />
{$addon.productname}{if $addon.domainname} - {$addon.domainname}{/if}<br />
<a href="#" onclick="removeItem('a','{$num}');return false" class="cartremove">[{$LANG.cartremove}]</a>
</td><td class="textcenter"><strong>{$addon.pricingtext}</strong></td></tr>
{/foreach}

{foreach key=num item=domain from=$domains}
<tr class="carttableproduct"><td>
<strong>{if $domain.type eq "register"}{$LANG.orderdomainregistration}{else}{$LANG.orderdomaintransfer}{/if}</strong> - {$domain.domain} - {$domain.regperiod} {$LANG.orderyears}<br />
{if $domain.dnsmanagement}&nbsp;&raquo; {$LANG.domaindnsmanagement}<br />{/if}
{if $domain.emailforwarding}&nbsp;&raquo; {$LANG.domainemailforwarding}<br />{/if}
{if $domain.idprotection}&nbsp;&raquo; {$LANG.domainidprotection}<br />{/if}
<a href="{$smarty.server.PHP_SELF}?a=confdomains" class="cartedit">[{$LANG.cartconfigdomainextras}]</a> <a href="#" onclick="removeItem('d','{$num}');return false" class="cartremove">[{$LANG.cartremove}]</a>
</td><td class="textcenter"><strong>{$domain.price}</strong></td></tr>
{/foreach}

{foreach key=num item=domain from=$renewals}
<tr class="carttableproduct"><td>
<strong>{$LANG.domainrenewal}</strong> - {$domain.domain} - {$domain.regperiod} {$LANG.orderyears}<br />
{if $domain.dnsmanagement}&nbsp;&raquo; {$LANG.domaindnsmanagement}<br />{/if}
{if $domain.emailforwarding}&nbsp;&raquo; {$LANG.domainemailforwarding}<br />{/if}
{if $domain.idprotection}&nbsp;&raquo; {$LANG.domainidprotection}<br />{/if}
<a href="#" onclick="removeItem('r','{$num}');return false" class="cartremove">[{$LANG.cartremove}]</a>
</td><td class="textcenter"><strong>{$domain.price}</strong></td></tr>
{/foreach}

{if $cartitems==0}
<tr class="clientareatableactive"><td colspan="2" class="textcenter">
<br />
{$LANG.cartempty}
<br /><br />
</td></tr>
{/if}

<tr class="summary"><td class="textright">{$LANG.ordersubtotal}: &nbsp;</td><td class="textcenter">{$subtotal}</td></tr>
{if $promotioncode}
<tr class="summary"><td class="textright">{$promotiondescription}: &nbsp;</td><td class="textcenter">{$discount}</td></tr>
{/if}
{if $taxrate}
<tr class="summary"><td class="textright">{$taxname} @ {$taxrate}%: &nbsp;</td><td class="textcenter">{$taxtotal}</td></tr>
{/if}
{if $taxrate2}
<tr class="summary"><td class="textright">{$taxname2} @ {$taxrate2}%: &nbsp;</td><td class="textcenter">{$taxtotal2}</td></tr>
{/if}
</table>

</form>

<div class="checkoutbuttonsleft">
<input type="button" value="{$LANG.emptycart}" onclick="emptyCart();return false" class="cartbutton red" /> <input type="button" value="{$LANG.continueshopping}" onclick="window.location='cart.php'" class="cartbutton" />
</div>
<div class="checkoutbuttonsright">
<div class="totalduetoday">{$LANG.ordertotalduetoday}: {$total}</div>
{if $totalrecurringmonthly || $totalrecurringquarterly || $totalrecurringsemiannually || $totalrecurringannually || $totalrecurringbiennially || $totalrecurringtriennially}
<div class="totalrecurring">{$LANG.ordertotalrecurring}: {if $totalrecurringmonthly}{$totalrecurringmonthly} {$LANG.orderpaymenttermmonthly}<br />{/if}
{if $totalrecurringquarterly}{$totalrecurringquarterly} {$LANG.orderpaymenttermquarterly}<br />{/if}
{if $totalrecurringsemiannually}{$totalrecurringsemiannually} {$LANG.orderpaymenttermsemiannually}<br />{/if}
{if $totalrecurringannually}{$totalrecurringannually} {$LANG.orderpaymenttermannually}<br />{/if}
{if $totalrecurringbiennially}{$totalrecurringbiennially} {$LANG.orderpaymenttermbiennially}<br />{/if}
{if $totalrecurringtriennially}{$totalrecurringtriennially} {$LANG.orderpaymenttermtriennially}<br />{/if}</div>
{/if}
<div class="promo">{if $promotioncode}{$LANG.orderpromotioncode}: {$promotioncode} (<a href="{$smarty.server.PHP_SELF}?a=removepromo">Remove Promo Code</a>){else}<input type="text" id="promocode" size="20" value="{$LANG.orderpromotioncode}" onfocus="if(this.value=='{$LANG.orderpromotioncode}')this.value=''" /> <input type="submit" value="{$LANG.go}" onclick="applypromo()" class="cartbutton" />{/if}</div>
</div>

<div class="clear"></div>

{foreach from=$gatewaysoutput item=gatewayoutput}
<div class="gatewaycheckout">{$gatewayoutput}</div>
{/foreach}

<div class="viewcartcol1">

<h2>{$LANG.yourdetails|strtolower}</h2>

<form method="post" action="{$smarty.server.PHP_SELF}?a=checkout" id="orderfrm">
<input type="hidden" name="submit" value="true" />

<input type="hidden" name="custtype" id="custtype" value="{$custtype}" />

<div id="loginfrm"{if $custtype eq "existing" && !$loggedin}{else} style="display:none;"{/if}>
<p>{$LANG.newcustomersignup|sprintf2:'<a href="#" onclick="showloginform();return false;">':'</a>'}</a></p>
<table width="100%" cellpadding="2">
<tr><td width="100">{$LANG.loginemail}:</td><td><input type="text" name="loginemail" style="width:80%;" value="{$username}" /></td></tr>
<tr><td>{$LANG.loginpassword}:</td><td><input type="password" name="loginpw" style="width:50%;" /></td></tr>
</table>
</div>

<div id="signupfrm"{if $custtype eq "existing" && !$loggedin} style="display:none;"{/if}>

{if !$loggedin}<p>{$LANG.alreadyregistered} <a href="{$smarty.server.PHP_SELF}?a=login" onclick="showloginform();return false;">{$LANG.clickheretologin}...</a></p>{/if}

<table width="100%" cellpadding="2">
<tr><td width="100">{$LANG.clientareafirstname}</td><td>{if $loggedin}{$clientsdetails.firstname}{else}<input type="text" name="firstname" style="width:80%;" value="{$clientsdetails.firstname}" />{/if}</td></tr>
<tr><td>{$LANG.clientarealastname}</td><td>{if $loggedin}{$clientsdetails.lastname}{else}<input type="text" name="lastname" style="width:80%;" value="{$clientsdetails.lastname}" />{/if}</td></tr>
<tr><td>{$LANG.clientareacompanyname}</td><td>{if $loggedin}{$clientsdetails.companyname}{else}<input type="text" name="companyname" style="width:80%;" value="{$clientsdetails.companyname}" />{/if}</td></tr>
<tr><td>{$LANG.clientareaemail}</td><td>{if $loggedin}{$clientsdetails.email}{else}<input type="text" name="email" style="width:90%;" value="{$clientsdetails.email}" />{/if}</td></tr>
<tr><td>{$LANG.clientareaaddress1}</td><td>{if $loggedin}{$clientsdetails.address1}{else}<input type="text" name="address1" style="width:80%;" value="{$clientsdetails.address1}" />{/if}</td></tr>
<tr><td>{$LANG.clientareaaddress2}</td><td>{if $loggedin}{$clientsdetails.address2}{else}<input type="text" name="address2" style="width:80%;" value="{$clientsdetails.address2}" />{/if}</td></tr>
<tr><td>{$LANG.clientareacity}</td><td>{if $loggedin}{$clientsdetails.city}{else}<input type="text" name="city" style="width:80%;" value="{$clientsdetails.city}" />{/if}</td></tr>
<tr><td>{$LANG.clientareastate}</td><td>{if $loggedin}{$clientsdetails.state}{else}<input type="text" name="state" style="width:80%;" value="{$clientsdetails.state}" />{/if}</td></tr>
<tr><td>{$LANG.clientareapostcode}</td><td>{if $loggedin}{$clientsdetails.postcode}{else}<input type="text" name="postcode" size="15" value="{$clientsdetails.postcode}" />{/if}</td></tr>
<tr><td>{$LANG.clientareacountry}</td><td>{if $loggedin}{$clientsdetails.country}{else}{$clientcountrydropdown}{/if}</td></tr>
<tr><td>{$LANG.clientareaphonenumber}</td><td>{if $loggedin}{$clientsdetails.phonenumber}{else}<input type="text" name="phonenumber" size="20" value="{$clientsdetails.phonenumber}" />{/if}</td></tr>
{if $securityquestions && !$loggedin}
<tr><td>{$LANG.clientareasecurityquestion}</td><td><select name="securityqid">
{foreach key=num item=question from=$securityquestions}
    <option value="{$question.id}"{if $question.id eq $securityqid} selected{/if}>{$question.question}</option>
{/foreach}
</select></td></tr>
<tr><td>{$LANG.clientareasecurityanswer}</td><td><input type="password" name="securityqans" value="{$securityqans}" size="30"></td></tr>
{/if}
{foreach key=num item=customfield from=$customfields}
<tr><td>{$customfield.name}</td><td>{$customfield.input} {$customfield.description}</td></tr>
{/foreach}
{if !$loggedin}
<tr><td>{$LANG.clientareapassword}</td><td><input type="password" name="password" id="newpw" size="20" value="{$password}" /></td></tr>
<tr><td>{$LANG.clientareaconfirmpassword}</td><td><input type="password" name="password2" size="20" value="{$password2}" /></td></tr>
<tr><td colspan="2" align="center"><script language="javascript">showStrengthBar();</script></td></tr>
{/if}
</table>

{if $taxenabled && !$loggedin}
<p align="center">{$LANG.carttaxupdateselections} <input type="submit" value="{$LANG.carttaxupdateselectionsupdate}" name="updateonly" class="cartbutton" /></p>
{/if}

</div>

{if $domainsinorder}
<br />
<h2>{$LANG.domainregistrantinfo|strtolower}</h2>
<p><select name="contact" id="domaincontact" onchange="domaincontactchange()">
<option value="">{$LANG.usedefaultcontact}</option>
{foreach from=$domaincontacts item=domcontact}
<option value="{$domcontact.id}"{if $contact==$domcontact.id} selected{/if}>{$domcontact.name}</option>
{/foreach}
<option value="addingnew"{if $contact eq "addingnew"} selected{/if}>{$LANG.clientareanavaddcontact}...</option>
</select><br /></p>
<div id="domaincontactfields"{if $contact eq "addingnew"} style="display:block"{/if}>
<table width="100%" cellpadding="2">
<tr><td width="100">{$LANG.clientareafirstname}</td><td><input type="text" name="domaincontactfirstname" style="width:80%;" value="{$domaincontact.firstname}" /></td></tr>
<tr><td>{$LANG.clientarealastname}</td><td><input type="text" name="domaincontactlastname" style="width:80%;" value="{$domaincontact.lastname}" /></td></tr>
<tr><td>{$LANG.clientareacompanyname}</td><td><input type="text" name="domaincontactcompanyname" style="width:80%;" value="{$domaincontact.companyname}" /></td></tr>
<tr><td>{$LANG.clientareaemail}</td><td><input type="text" name="domaincontactemail" style="width:90%;" value="{$domaincontact.email}" /></td></tr>
<tr><td width="100">{$LANG.clientareaaddress1}</td><td><input type="text" name="domaincontactaddress1" style="width:80%;" value="{$domaincontact.address1}" /></td></tr>
<tr><td>{$LANG.clientareaaddress2}</td><td><input type="text" name="domaincontactaddress2" style="width:80%;" value="{$domaincontact.address2}" /></td></tr>
<tr><td>{$LANG.clientareacity}</td><td><input type="text" name="domaincontactcity" style="width:80%;" value="{$domaincontact.city}" /></td></tr>
<tr><td>{$LANG.clientareastate}</td><td><input type="text" name="domaincontactstate" style="width:80%;" value="{$domaincontact.state}" /></td></tr>
<tr><td>{$LANG.clientareapostcode}</td><td><input type="text" name="domaincontactpostcode" size="15" value="{$domaincontact.postcode}" /></td></tr>
<tr><td>{$LANG.clientareacountry}</td><td>{$domaincontactcountrydropdown}</td></tr>
<tr><td>{$LANG.clientareaphonenumber}</td><td><input type="text" name="domaincontactphonenumber" size="20" value="{$domaincontact.phonenumber}" /></td></tr>
</table>
</div>
{/if}

</div>

<div class="viewcartcol2">

<h2>{$LANG.orderpaymentmethod|strtolower}</h2>
<p class="paymentmethods">{foreach key=num item=gateway from=$gateways}<label><input type="radio" name="paymentmethod" value="{$gateway.sysname}" onclick="{if $gateway.type eq "CC"}showCCForm(){else}hideCCForm(){/if}"{if $selectedgateway eq $gateway.sysname} checked{/if} />&lt;img src=&quot;images/paymentmethod/{$gateway.sysname}.jpg&quot; alt=&quot;{$gateway.name}&quot; width=&quot;88&quot; height=&quot;31&quot; border=&quot;0&quot; align=&quot;absmiddle&quot;&gt;</label><br />{/foreach}</p>

<div id="ccinputform"{if $selectedgatewaytype neq "CC"} style="display:none;"{/if}>
<table width="100%" cellpadding="2">
{if $clientsdetails.cclastfour}<tr><td colspan="2"><label><input type="radio" name="ccinfo" value="useexisting" id="useexisting" onclick="useExistingCC()"{if $clientsdetails.cclastfour} checked{else} disabled{/if} /> {$LANG.creditcarduseexisting}{if $clientsdetails.cclastfour} ({$clientsdetails.cclastfour}){/if}</label><br />
<label><input type="radio" name="ccinfo" value="new" id="new" onclick="enterNewCC()"{if !$clientsdetails.cclastfour || $ccinfo eq "new"} checked{/if} /> {$LANG.creditcardenternewcard}</label></td></tr>{else}<input type="hidden" name="ccinfo" value="new" />{/if}
<tr class="newccinfo"{if $clientsdetails.cclastfour && $ccinfo neq "new"} style="display:none;"{/if}><td width="100">{$LANG.creditcardcardtype}</td><td><select name="cctype" id="cctype">
{foreach key=num item=cardtype from=$acceptedcctypes}
<option{if $cctype eq $cardtype} selected{/if}>{$cardtype}</option>
{/foreach}
</select></td></tr>
<tr class="newccinfo"{if $clientsdetails.cclastfour && $ccinfo neq "new"} style="display:none;"{/if}><td>{$LANG.creditcardcardnumber}</td><td><input type="text" name="ccnumber" value="{$ccnumber}" style="width:80%;" autocomplete="off" /></td></tr>
<tr class="newccinfo"{if $clientsdetails.cclastfour && $ccinfo neq "new"} style="display:none;"{/if}><td>{$LANG.creditcardcardexpires}</td><td><select name="ccexpirymonth" id="ccexpirymonth" class="newccinfo">{foreach from=$months item=month}
<option{if $ccexpirymonth eq $month} selected{/if}>{$month}</option>
{/foreach}</select> / <select name="ccexpiryyear" class="newccinfo">
{foreach from=$expiryyears item=year}
<option{if $ccexpiryyear eq $year} selected{/if}>{$year}</option>
{/foreach}</select></td></tr>
{if $showccissuestart}
<tr class="newccinfo"{if $clientsdetails.cclastfour && $ccinfo neq "new"} style="display:none;"{/if}><td>{$LANG.creditcardcardstart}</td><td><select name="ccstartmonth" id="ccstartmonth" class="newccinfo">{foreach from=$months item=month}
<option{if $ccstartmonth eq $month} selected{/if}>{$month}</option>
{/foreach}</select> / <select name="ccstartyear" class="newccinfo">
{foreach from=$startyears item=year}
<option{if $ccstartyear eq $year} selected{/if}>{$year}</option>
{/foreach}</select></td></tr>
<tr class="newccinfo"{if $clientsdetails.cclastfour && $ccinfo neq "new"} style="display:none;"{/if}><td>{$LANG.creditcardcardissuenum}</td><td><input type="text" name="ccissuenum" value="{$ccissuenum}" size="5" maxlength="3" /></td></tr>
{/if}
<tr><td width="100">{$LANG.creditcardcvvnumber}</td><td><input type="text" name="cccvv" id="cccvv" value="{$cccvv}" size="5" autocomplete="off" /></td></tr>
<tr><td></td><td><a href="#" onclick="window.open('images/ccv.gif','','width=280,height=200,scrollbars=no,top=100,left=100');return false">{$LANG.creditcardcvvwhere}</a></td></tr>
{if $shownostore}<tr><td><input type="checkbox" name="nostore" id="nostore" /></td><td><label for="nostore">{$LANG.creditcardnostore}</label></td></tr>{/if}
</table>
</div>

<br />

{if $shownotesfield}
<h2>{$LANG.ordernotes|strtolower}</h2>
<p align="center"><textarea name="notes" rows="3" style="width:95%" onFocus="if(this.value=='{$LANG.ordernotesdescription}'){ldelim}this.value='';{rdelim}" onBlur="if (this.value==''){ldelim}this.value='{$LANG.ordernotesdescription}';{rdelim}">{$notes}</textarea></p>
{/if}

<br />

{if $accepttos}
<p align="center"><label><input type="checkbox" name="accepttos" id="accepttos" /> {$LANG.ordertosagreement} <a href="{$tosurl}" target="_blank">{$LANG.ordertos}</a></label><p>
{/if}

<p align="center"><input type="submit" value="{$LANG.completeorder} &raquo;"{if $cartitems==0} disabled{/if} onclick="this.value='{$LANG.pleasewait}'" class="cartbutton green" /></p>

</div>

<div class="clear"></div>

<div class="checkoutsecure"><img align="left" src="images/padlock.gif" border="0" vspace="5" alt="Secure Transaction" style="padding-right: 10px;" /> {$LANG.ordersecure} (<strong>{$ipaddress}</strong>) {$LANG.ordersecure2}</div>

</div>

</form>

</div>
