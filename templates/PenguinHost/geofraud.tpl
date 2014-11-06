<div class="errorbox" style="margin: 5px;"> 

    	<h2>Error</h2> 

        We were unable to automatically verify your address. Don't be alarmed, this is just precaution and we are sure we can help you straighten this out. Please verify your address in the client area and contact us through a <a href="submitticket.php">support ticket</a>.
        

</div>

<div style="margin: 5px;">
Address on File:<br />
<table style="border-collapse:collapse; border:1px solid #999;" cellspacing="2" cellpadding="2" border="1">
	<tr>
    	<td>Address:</td><td>{$client.address1}{if $client.address2}<br />{$client.address2}{/if}</td>
    </tr>
    <tr>
        <td>City:</td><td>{$client.city}</td>
    </tr>
    <tr>
    	<td>State:</td><td>{$client.state}</td>
    </tr>
    <tr>
   		<td>Postal Code:</td><td>{$client.postcode}</td>
    </tr>
    <tr>
    	<td>Country:</td><td>{$client.country}</td>
    </tr>
</table>
</div>