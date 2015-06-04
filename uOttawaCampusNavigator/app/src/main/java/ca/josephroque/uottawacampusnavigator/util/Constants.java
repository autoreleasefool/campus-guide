package ca.josephroque.uottawacampusnavigator.util;

/**
 * Created by Joseph Roque on 15-05-24.
 * <p/>
 * Provides constant values which must be accessible across the application.
 */
public class Constants
{

    // LANGUAGE CONSTANTS

    /**
     * Identifier for the preference which indicates the language selected
     * - English (true) or French (false).
     */
    public static final String PREF_LANGUAGE_SELECTED = "pref_global_lang_selected";
	
	/** English items that appear in navigation drawer. */
	public static final String[] NAVIGATION_DRAWER_ITEMS_EN = {
			"Home",
			"Navigation",
			"Favourites",
			"Useful Links",
			"Bus Information",
			"Accessibility",
			"Campus Hotspots",
			"Settings",
			"Help & Feedback",
			"Language",
	};
	
	// TODO: translate to french
	/** French items that appear in navigation drawer.  */
	public static final String[] NAVIGATION_DRAWER_ITEMS_FR = {
			"Acceuil",
			"Navigation",
			"Favoris",
			"Liens utile",
			"Informations des buses",
			"Accessibilité",
			"Boîte de nuit de campus",
			"Paramètres",
			"Aide et commentairs",
			"Langue",
	};

	// NAVIGATION DRAWER CONSTANTS
	
	/** Represents position of "Home" item in the navigation drawer. */
	public static final byte NAVIGATION_ITEM_HOME = 0;
	/** Represents position of "Find" item in the navigation drawer. */
	public static final byte NAVIGATION_ITEM_FIND = 1;
	/** Represents position of "Favourites" item in the navigation drawer. */
	public static final byte NAVIGATION_ITEM_FAVOURITES = 2;
	/** Represents position of "Useful Links" item in the navigation drawer. */
	public static final byte NAVIGATION_ITEM_USEFUL_LINKS = 3;
	/** Represents position of "Bus Info" item in the navigation drawer. */
	public static final byte NAVIGATION_ITEM_BUS_INFO = 4;
	/** Represents position of "Accessibility" item in the navigation drawer. */
	public static final byte NAVIGATION_ITEM_ACCESSIBILITY = 5;
	/** Represents position of "Hotspots" item in the navigation drawer. */
	public static final byte NAVIGATION_ITEM_HOTSPOTS = 6;
	/** Represents position of "Settings" item in the navigation drawer. */
	public static final byte NAVIGATION_ITEM_SETTINGS = 7;
	/** Represents position of "Help" item in the navigation drawer. */
	public static final byte NAVIGATION_ITEM_HELP = 8;
	/** Represents position of "Language" item in the navigation drawer. */
	public static final byte NAVIGATION_ITEM_LANGUAGE = 9;

	// FRAGMENT CONSTANTS
	
	/** Identifies an instance of HomeFragment on the fragment backstack. */
	public static final String FRAGMENT_HOME = "frag_home";
	/** Identifies an instance of FindFragment on the fragment backstack. */
	public static final String FRAGMENT_FIND = "frag_find";
	/** Identifies an instance of FavouritesFragment on the fragment backstack. */
	public static final String FRAGMENT_FAVOURITES = "frag_fave";
	/** Identifies an instance of LinksFragment on the fragment backstack. */
	public static final String FRAGMENT_LINKS = "frag_links";
	/** Identifies an instance of BusInfoFragment on the fragment backstack. */
	public static final String FRAGMENT_BUS_INFO = "frag_bus_info";
	/** Identifies an instance of AcessibilityFragment on the fragment backstack. */
	public static final String FRAGMENT_ACCESSIBILITY = "frag_access";
	/** Identifies an instance of HotspotsFragment on the fragment backstack. */
	public static final String FRAGMENT_HOTSPOTS = "frag_hot";
	/** Identifies an instance of HelpFragment on the fragment backstack. */
	public static final String FRAGMENT_HELP = "frag_help";
	/** Identifies an instnace of LanguageFragment on the fragment backstack. */
	public static final String FRAGMENT_LANGUAGE = "frag_lang";
}
