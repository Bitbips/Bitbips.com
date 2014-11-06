
 {if $filename eq 'index'}

{else}
{if $filename eq 'sharedhosting' or $filename eq 'voipservices' or $filename eq 'webdesign' or $filename eq 'gameandvoice' or $filename eq 'vpservers'}
</div>
</div>
</div>
<div id="right">

{if !$loggedin}
      <div class="box3">
        <div class="box3top"></div>
        <div class="box3content">
        <h1>{$LANG.clientlogin}</h1>
<form method="post" action="{$systemsslurl}dologin.php">
          <div class="box3content2">
            <ul>
              <li>
                <label>{$LANG.email}</label>
              </li>
              <li>
              <input type="text" name="username" id="textfield" class="textfielstyle1" />
              </li>
              <li>
              <label>{$LANG.loginpassword}</label>
              </li>
              <li>
              <input type="password" name="password" id="textfield" class="textfielstyle1" />
              </li>
              <li>
              <input type="checkbox" name="rememberme" id="checkbox" />
              <label for="checkbox">{$LANG.loginrememberme}</label>
              </li>
              <li><div class="login"><input type="submit" class="button square small black" value="{$LANG.loginbutton}" /></div></li>
            <li><a href="pwreset.php">{$LANG.loginforgotteninstructions}</a></li>
            </ul>
          </div>
</form>
        </div>
      </div>
{/if}
      <div class="box3">
        <div class="box3top"></div>
        <div class="box3content">
          <h1>{$LANG.quicknav}</h1>
          <div class="box3content2">
            <ul class="sidemenu">
	{if $loggedin}
	  <li><a href="clientarea.php" title="{$LANG.clientareanavhome}">{$LANG.clientareanavhome}</a></li>
      <li><a href="clientarea.php?action=details" title="{$LANG.clientareanavdetails}">{$LANG.clientareanavdetails}</a></li>
      <li><a href="clientarea.php?action=products" title="{$LANG.clientareanavservices}">{$LANG.clientareanavservices}</a></li>
      <li><a href="clientarea.php?action=domains" title="{$LANG.clientareanavdomains}">{$LANG.clientareanavdomains}</a></li>
      <li><a href="clientarea.php?action=quotes" title="{$LANG.quotestitle}">{$LANG.quotestitle}</a></li>
      <li><a href="clientarea.php?action=invoices" title="{$LANG.invoices}">{$LANG.invoices}</a></li>
      <li><a href="supporttickets.php" title="{$LANG.clientareanavsupporttickets}">{$LANG.clientareanavsupporttickets}</a></li>
      <li><a href="affiliates.php" title="{$LANG.affiliatestitle}">{$LANG.affiliatestitle}</a></li>
      <li><a href="clientarea.php?action=emails" title="{$LANG.clientareaemails}">{$LANG.clientareaemails}</a></li>
      <li><a href="cart.php" title="{$LANG.ordertitle}">{$LANG.ordertitle}</a></li>
      <li><a href="logout.php" title="{$LANG.logouttitle}">{$LANG.logouttitle}</a></li>
	  {else}
      <li><a href="clientportal.php" title="{$LANG.globalsystemname}">{$LANG.globalsystemname}</a></li>
      <li><a href="register.php" title="{$LANG.clientregistertitle}">{$LANG.clientregistertitle}</a></li>
      <li><a href="clientarea.php" title="{$LANG.clientareatitle}">{$LANG.clientareatitle}</a></li>
      <li><a href="announcements.php" title="{$LANG.announcementstitle}">{$LANG.announcementstitle}</a></li>
      <li><a href="knowledgebase.php" title="{$LANG.knowledgebasetitle}">{$LANG.knowledgebasetitle}</a></li>
      <li><a href="submitticket.php" title="{$LANG.supportticketspagetitle}">{$LANG.supportticketssubmitticket}</a></li>
      <li><a href="downloads.php" title="{$LANG.downloadstitle}">{$LANG.downloadstitle}</a></li>
      <li><a href="cart.php" title="{$LANG.ordertitle}">{$LANG.ordertitle}</a></li>
	  {/if}
            </ul>
          </div>
        </div>
      </div>

{if $loggedin}
      <div class="box3">
        <div class="box3top"></div>
        <div class="box3content">
          <h1>{$LANG.accountinfo}</h1>
          <div class="box3content2">
<p><strong>{$clientsdetails.firstname} {$clientsdetails.lastname} {if $clientsdetails.companyname}({$clientsdetails.companyname}){/if}</strong><br />
{$clientsdetails.address1}, {$clientsdetails.address2}<br />
{$clientsdetails.city}, {$clientsdetails.state}, {$clientsdetails.postcode}<br />
{$clientsdetails.countryname}<br />
{$clientsdetails.email}<br /><br />
{if $addfundsenabled}<img src="templates/{$template}/img/money.gif" alt="Add Funds" width="22" height="22" border="0" class="absmiddle" /> <a href="clientarea.php?action=addfunds">{$LANG.addfunds}</a>{/if}</p>
          </div>
        </div>
      </div>
{/if}
{if $loggedin}
      <div class="box3">
        <div class="box3top"></div>
        <div class="box3content">
          <h1>{$LANG.accountstats}</h1>
          <div class="box3content2">
    <p>{$LANG.statsnumproducts}: <strong>{$clientsstats.productsnumactive}</strong> ({$clientsstats.productsnumtotal})<br />
{$LANG.statsnumdomains}: <strong>{$clientsstats.numactivedomains}</strong> ({$clientsstats.numdomains})<br />
{$LANG.statsnumtickets}: <strong>{$clientsstats.numtickets}</strong><br />
{$LANG.statsnumreferredsignups}: <strong>{$clientsstats.numaffiliatesignups}</strong><br />
{$LANG.statscreditbalance}: <strong>{$clientsstats.creditbalance}</strong><br />
{$LANG.statsdueinvoicesbalance}: <strong>{if $clientsstats.numdueinvoices>0}<span class="red">{/if}{$clientsstats.dueinvoicesbalance}{if $clientsstats.numdueinvoices>0}</span>{/if}</strong></p>
          </div>
        </div>
      </div>
{/if}
{if $twitterusername}
      <div class="box3">
        <div class="box3top"></div>
        <div class="box3content">
          <h1>Follow Us on Twitter</h1>
          <div class="box3content2">
<center><a href="http://www.twitter.com/{$twitterusername}" target="_blank"><img src="templates/{$template}/img/twitter.png" border="0px" /></a></center>
          </div>
        </div>
      </div>
{/if}
    </div>
      <div class="clr"></div>
    <div class="partner">&nbsp;</div>

{else}
{if $langchange}<div align="right">{$setlanguage}</div>{/if}

{if $pagetitle eq $LANG.carttitle}</div>{/if}

    </div>
</div>
	</div>
{/if}
{/if}
    <div class="sitemapwarpper">
      <div class="sitemap">
        <h1>Company</h1>
        <ul>
        <li><a href="contact.php">Contact Us</a></li>
        <li><a href="terms.php">Terms and Conditions</a></li>
        <li><a href="privacy.php">Privacy Policy</a><br />
        </ul>
      </div>
      <div class="sitemap">
        <h1>Hosting Solutions</h1>
        <ul>
        <li><a href="sharedhosting.php">Shared Hosting</a></li>
        <li><a href="vpservers.php">Virtual Private Servers</a></li>
        <li><a href="domainchecker.php">Domain Registration</a></li>
        </ul>
      </div>
      <div class="sitemap">
        <h1>Social</h1>
        <ul>
		<li><a href="http://themeforest.net/?ref=ZumadaLimited" target="_blank">Theme Forest</a></li>
   	    <li><a href="http://graphicriver.net/?ref=ZumadaLimited" target="_blank">Graphic River</a></li>
   	    <li><a href="http://codecanyon.net/?ref=ZumadaLimited" target="_blank">Code Canyon</a></li>
        </ul>
      </div>
      <div class="sitemap">
        <h1>Client Area</h1>
        <ul>
    	  <li><a href="affiliates.php">Affiliate System</a></li>
    	  <li><a href="knowledgebase.php">Knowledgebase</a></li>
    	  <li><a href="submitticket.php">Submit Ticket</a></li>
        </ul>
      </div>
    </div>
    <div class="clr"></div>
  </div>
  <div class="clr"></div>
</div>
<div id="footerwrapper">
  <div class="wrapper">
    <div class="footerC"> <a class="noborderLT" href="index.php">Home</a><a href="sharedhosting.php">Shared&nbsp;Hosting</a><a href="vpservers.php">VPS&nbsp;Hosting</a><a href="domainchecker.php">Domain&nbsp;Registration</a><a href="clientportal.php">Client&nbsp;Portal</a><a class="noborderRT" href="contact.php">Contact&nbsp;Us</a> </div>
    <div class="clr"></div>
   <div class="copyright">&copy; Copyright <a href="https://www.Bitbips.com" target="_blank"><font color="#FFFFFF">Bitbips.com</font></a> {$date_year}. All rights reserved.</div>
    <div class="clr"></div>
  </div>
</div>
{$footeroutput}
</body>
</html>
