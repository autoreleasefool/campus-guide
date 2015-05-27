package ca.josephroque.uottawacampusnavigator.util;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.FeatureInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.view.Gravity;
import android.widget.TextView;

import ca.josephroque.uottawacampusnavigator.R;

/**
 * Created by Joseph Roque on 15-05-27.
 * <p/>
 * Provides methods which offer some utility outside of the application.
 */
public class ExternalUtil
{

	/**
	 * Opens link in a browser
	 *
	 * @param sourceActivity activity to open intent with
	 * @param url hyperlink to open in browser
	 */
	public static void openLinkInBrowser(Activity sourceActivity, String url)
	{
		if (!url.startsWith("http://") && !url.startsWith("https://"))
			url = "http://" + url;

		Uri uri = Uri.parse(url);
		Intent browserIntent = new Intent(Intent.ACTION_VIEW, uri);
		sourceActivity.startActivity(browserIntent);
	}
	
	/**
	 * Prompts user to dial a phone number.
	 *
	 * @param sourceActivity activity to open intent with
	 * @param phoneNumber number to call
	 */
	public static void dialPhoneNumber(final Activity sourceActivity, String phoneNumber)
	{
		if (!isFeatureAvailable(sourceActivity, PackageManager.FEATURE_TELEPHONY))
			return;
		
		final String rawPhoneNumber = DataFormatter.stripNonDigits(phoneNumber);
		if (phoneNumber.length() != 10)
			throw new IllegalArgumentException(
					"Only supports calling 10-digit numbers: " + phoneNumber);
		
		// Prompts user before dialing number
		TextView textMessage = new TextView(sourceActivity);
		textMessage.setText(sourceActivity.getResources().getString(R.string.text_dial_confirmation)
                + DataFormatter.formatPhoneNumber(phoneNumber) + "?");
		textMessage.setGravity(Gravity.CENTER_HORIZONTAL);
		
		new AlertDialog.Builder(sourceActivity)
				.setTitle(R.string.text_dial_number)
				.setView(textMessage)
				.setPositiveButton(R.string.dialog_text_dial, new DialogInterface.OnClickListener()
				{
					@Override
					public void onClick(DialogInterface dialog, int which)
					{
						// Creates intent to dial phone number
						Intent dialIntent = new Intent(Intent.ACTION_DIAL);
						dialIntent.setData(Uri.parse("tel:" + rawPhoneNumber));
						sourceActivity.startActivity(dialIntent);
						
						dialog.dismiss();
					}
				})
				.setNegativeButton(R.string.dialog_text_cancel,
                        new DialogInterface.OnClickListener()
                        {
                            @Override
                            public void onClick(DialogInterface dialog, int which)
                            {
                                dialog.dismiss();
                            }
				})
				.create()
				.show();
	}
	
	/**
	 * Checks if a specified feature is available to the device.
	 *
	 * @param context source context for package manager
	 * @param feature device feature to check for
	 */
	public static boolean isFeatureAvailable(Context context, String feature)
	{
		final PackageManager packageManager = context.getPackageManager();
		final FeatureInfo[] featuresList = packageManager.getSystemAvailableFeatures();
		for (FeatureInfo f : featuresList)
		{
			if (f.name != null && f.name.equals(feature))
				return true;
		}
		
		return false;
	}
}