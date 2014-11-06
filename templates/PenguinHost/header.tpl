<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="content-type" content="text/html; charset={$charset}" />
<title>{if $kbarticle.title}{$kbarticle.title} - {/if}{$pagetitle} - {$companyname}</title>
<!-- stardevelop.com Live Help International Copyright - All Rights Reserved //-->
<!-- BEGIN stardevelop.com Live Help Messenger Code - Copyright - NOT PERMITTED TO MODIFY COPYRIGHT LINE / LINK //-->
<script type="text/JavaScript" src="/livehelp/scripts/jquery-latest.js"></script>
<script type="text/javascript">
    var LiveHelpSettings = {};
    LiveHelpSettings.server = 'www.bitbips.com/client/modules';
    LiveHelpSettings.embedded = true;
    (function(d, $, undefined) {
        $(window).ready(function() {
            // JavaScript
            var LiveHelp = d.createElement('script'); LiveHelp.type = 'text/javascript'; LiveHelp.async = true;
            LiveHelp.src = ('https:' == d.location.protocol ? 'https://' : 'http://') + LiveHelpSettings.server + '/livehelp/scripts/jquery.livehelp.js';
            var s = d.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(LiveHelp, s);
        });
    })(document, jQuery);
</script>
<!-- END stardevelop.com Live Help Messenger Code - Copyright - NOT PERMITTED TO MODIFY COPYRIGHT LINE / LINK //-->
{if $systemurl}<base href="{$systemurl}" />{/if}
<script type="text/javascript" src="includes/jscript/jquery.js"></script>
{if $livehelpjs}{$livehelpjs}{/if}
<link href="templates/{$template}/css/bootstrap.css" rel="stylesheet">
<link href="templates/{$template}/css/whmcs.css" rel="stylesheet">
<link rel="shortcut icon" type="image/x-icon" href="https://www.whmcsthemes.com/favicon.png" />
<script src="templates/{$template}/js/whmcs.js"></script>
    {$headoutput}
<link rel="stylesheet" type="text/css" href="templates/{$template}/glossy-buttons.css"/>
<link href="templates/{$template}/html/css/style.css" rel="stylesheet" type="text/css" />
<link rel="stylesheet" type="text/css" href="templates/{$template}/html/css/superfish.css" media="screen">
</head>

<body>
{$headeroutput}
<div id="headerWrapper">
  <div class="wrapper">
	<div id="topmenu">
      <div class="livehelp"><!-- stardevelop.com Live Help International Copyright - All Rights Reserved //-->
<a href="#" class="LiveHelpButton"><img src="../clients/modules/livehelp/include/status.php" id="LiveHelpStatus" name="LiveHelpStatus" class="LiveHelpStatus" border="0" alt="Live Help" /></a>
<!-- END Live Help HTML Code - NOT PERMITTED TO MODIFY IMAGE MAP/CODE/LINKS //--></div>
	  <ul>
{if $loggedin}
        <li><a href="clientarea.php">My Account</a></li>
        <li><a href="logout.php">Logout</a></li>
        <li class="nobg"><a href="cart.php?a=view">View Cart</a></li>
{else}
        <li><a href="clientarea.php">Client Login</a></li>
        <li><a href="register.php">Register</a></li>
        <li class="nobg"><a href="cart.php?a=view">View Cart</a></li>
{/if}
      </ul>
    </div>
    <div class="logo"><a href="index.php"></a></div>
<div class="clr"></div>
	<div id="menu">
	  <ul class="sf-menu">
		<li class="home"><a href="index.php"{if $filename eq 'index'} class="active"{/if}><span></span>Home</a></li>
		<li class="webdesign"><a href="webdesign.php"{if $filename eq 'webdesign'} class="active"{/if}><span></span>Web Design</a></li>
		<li class="shared"><a href="sharedhosting.php"{if $filename eq 'sharedhosting'} class="active"{/if}><span></span>Shared Hosting</a></li>
		<li class="vpservers"><a href="vpservers.php"{if $filename eq 'vpservers'} class="active"{/if}><span></span>VPS Servers</a>
        <li class="support"><a href="support.bitbips.com"{if $filename eq 'voipservices'} class="active"{/if}><span></span>Remote Support</a></li>
	    <li class="gameandvoice"><a href="gameandvoice.php"{if $filename eq 'gameandvoice'} class="active"{/if}><span></span>Game Server's</a></li>
		<li class="about"><a href="clientportal.php"{if $filename eq 'clientportal'} class="active"{else}class="nobg"{/if}>Client Portal</a></li>
		
      </ul>
    </div>
  </div>
</div>
{if $filename eq 'index' or $filename eq 'sharedhosting' or $filename eq 'voipservices' or $filename eq 'webdesign' or $filename eq 'gameandvoice' or $filename eq 'vpservers'}

{else}
<div id="subbannerwrapper">
  <div class="wrapper">
    <div class="subbanner">
      <h1>{$pagetitle}</h1>
      <h2 style="margin-top:20px;">{$todaysdate}</h2>
    </div>
  </div>
</div>

<div id="contentwrapper">
<div class="wrapper">

<div id="whmcsthemes" style="margin-top:20px;">
  <div class="navbar navbar-fixed-top">
    <div class="navbar-inner">
      <div class="container">
        <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </a>
        <div class="nav-collapse">
		<ul class="nav">
			<li><a href="{if $loggedin}clientarea{else}clientportal{/if}.php">{$LANG.hometitle}</a></li>
		</ul>
{if $loggedin}
    <ul class="nav">
        <li class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown" href="#">{$LANG.navservices}&nbsp;<b class="caret"></b></a>
          <ul class="dropdown-menu">
            <li><a href="clientarea.php?action=products">{$LANG.clientareanavservices}</a></li>
            {if $condlinks.pmaddon}<li><a href="index.php?m=project_management">{$LANG.clientareaprojects}</a></li>{/if}
            <li class="divider"></li>
            <li><a href="cart.php">{$LANG.navservicesorder}</a></li>
            <li><a href="cart.php?gid=addons">{$LANG.clientareaviewaddons}</a></li>
          </ul>
        </li>
      </ul>


		  {if $condlinks.domainreg || $condlinks.domaintrans}<ul class="nav">
			<li class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown" href="#">{$LANG.navdomains}&nbsp;<b class="caret"></b></a>
			  <ul class="dropdown-menu">
				<li><a href="clientarea.php?action=domains">{$LANG.clientareanavdomains}</a></li>
				<li class="divider"></li>
				<li><a href="cart.php?gid=renewals">{$LANG.navrenewdomains}</a></li>
				{if $condlinks.domainreg}<li><a href="cart.php?a=add&domain=register">{$LANG.navregisterdomain}</a></li>{/if}
				{if $condlinks.domaintrans}<li><a href="cart.php?a=add&domain=transfer">{$LANG.navtransferdomain}</a></li>{/if}
                {if $enomnewtldsenabled}<li><a href="index.php?m=enomnewtlds">Preregister New TLDs</a></li>{/if}
				<li class="divider"></li>
				<li><a href="domainchecker.php">{$LANG.navwhoislookup}</a></li>
			  </ul>
			</li>
		  </ul>{/if}

		  <ul class="nav">
			<li class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown" href="#">{$LANG.navbilling}&nbsp;<b class="caret"></b></a>
			  <ul class="dropdown-menu">
				<li><a href="clientarea.php?action=invoices">{$LANG.invoices}</a></li>
				<li><a href="clientarea.php?action=quotes">{$LANG.quotestitle}</a></li>
				<li class="divider"></li>
				{if $condlinks.addfunds}<li><a href="clientarea.php?action=addfunds">{$LANG.addfunds}</a></li>{/if}
				{if $condlinks.masspay}<li><a href="clientarea.php?action=masspay&all=true">{$LANG.masspaytitle}</a></li>{/if}
				{if $condlinks.updatecc}<li><a href="clientarea.php?action=creditcard">{$LANG.navmanagecc}</a></li>{/if}
			  </ul>
			</li>
		  </ul>

		  <ul class="nav">
			<li class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown" href="#">{$LANG.navsupport}&nbsp;<b class="caret"></b></a>
			  <ul class="dropdown-menu">
				<li><a href="supporttickets.php">{$LANG.navtickets}</a></li>
				<li><a href="knowledgebase.php">{$LANG.knowledgebasetitle}</a></li>
				<li><a href="downloads.php">{$LANG.downloadstitle}</a></li>
				<li><a href="serverstatus.php">{$LANG.networkstatustitle}</a></li>
			  </ul>
			</li>
		  </ul>

		  <ul class="nav">
			<li><a href="submitticket.php">{$LANG.navopenticket}</a></li>
		  </ul>

		  {if $condlinks.affiliates}<ul class="nav">
            <li><a href="affiliates.php">{$LANG.affiliatestitle}</a></li>
		  </ul>{/if}

		  <ul class="nav pull-right">
			<li class="dropdown">
			  <a href="#" class="dropdown-toggle" data-toggle="dropdown">{$LANG.hello}, {$loggedinuser.firstname}!&nbsp;<b class="caret"></b></a>
			  <ul class="dropdown-menu">
				<li><a href="clientarea.php?action=details">{$LANG.editaccountdetails}</a></li>
				{if $condlinks.updatecc}<li><a href="clientarea.php?action=creditcard">{$LANG.navmanagecc}</a></li>{/if}
				<li><a href="clientarea.php?action=contacts">{$LANG.clientareanavcontacts}</a></li>
				{if $condlinks.addfunds}<li><a href="clientarea.php?action=addfunds">{$LANG.addfunds}</a></li>{/if}
				<li><a href="clientarea.php?action=emails">{$LANG.navemailssent}</a></li>
				<li><a href="clientarea.php?action=changepw">{$LANG.clientareanavchangepw}</a></li>
				<li class="divider"></li>
				<li><a href="logout.php">{$LANG.logouttitle}</a></li>
			  </ul>
			</li>
		  </ul>
{else}
		  <ul class="nav">
			<li><a href="announcements.php">{$LANG.announcementstitle}</a></li>
		  </ul>
          
		  <ul class="nav">
			<li><a href="knowledgebase.php">{$LANG.knowledgebasetitle}</a></li>
		  </ul>
          
		  <ul class="nav">
			<li><a href="serverstatus.php">{$LANG.networkstatustitle}</a></li>
		  </ul>
          
		  <ul class="nav">
			<li><a href="affiliates.php">{$LANG.affiliatestitle}</a></li>
		  </ul>
          
		  <ul class="nav">
			<li><a href="contact.php">{$LANG.contactus}</a></li>
		  </ul>

		  <ul class="nav pull-right">
			<li class="dropdown"><a class="dropdown-toggle" data-toggle="dropdown" href="#">{$LANG.account}&nbsp;<b class="caret"></b></a>
			  <ul class="dropdown-menu">
				<li><a href="clientarea.php">{$LANG.login}</a></li>
				<li><a href="register.php">{$LANG.register}</a></li>
				<li class="divider"></li>
				<li><a href="pwreset.php">{$LANG.forgotpw}</a></li>
			  </ul>
			</li>
		  </ul>
{/if}

        </div><!-- /.nav-collapse -->
      </div>
    </div><!-- /navbar-inner -->
  </div><!-- /navbar -->


<div class="whmcscontainer" style="border:1px solid #333; border-radius:10px;margin-top:15px;margin-bottom:25px;">
    <div class="contentpadded">

{if $pagetitle eq $LANG.carttitle}<div id="whmcsorderfrm">{/if}

{/if}