package ca.josephroque.uottawacampusnavigator.util;

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
	 * @param link hyperlink to open in browser
	 */
	public static void openLinkInBrowser(Activity sourceActivity, String link)
	{
		if (!url.startsWith("http://") && !url.startsWith("https://"))
			url = "http://" + url;

		Uri uri = Uri.parse(link);
		Intent browserIntent = new Intent(Intent.ACTION_VIEW, uri);
		sourceActivity.startActivity(browserIntent);
	}
	
	/**
	 * Prompts user to dial a phone number.
	 *
	 * @param sourceActivity activity to open intent with
	 * @param phoneNumber number to call
	 */
	public static void dialPhoneNumber(Activity sourceActivity, String phoneNumber)
	{
		if (!isFeatureAvailable(PackageManager.FEATURE_TELEPHONY))
			return;
		
		phoneNumber = DataFormatter.stripNonDigits(phoneNumber);
		if (phoneNumber.length() != 10)
			throw IllegalArgumentException("Only supports calling 10-digit numbers: " + phoneNumber);
		
		// TODO: prompt user before dialing
		
		Intent dialIntent = new Intent(Intent.ACTION_DIAL);
		intent.setData(Uri.parse("tel:" + phoneNumber));
		sourceActivity.startActivity(dialIntent);
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