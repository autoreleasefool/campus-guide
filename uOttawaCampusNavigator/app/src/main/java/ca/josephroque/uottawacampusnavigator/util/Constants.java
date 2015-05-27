package ca.josephroque.uottawacampusnavigator.util;

/**
 * Created by Joseph Roque on 15-05-24.
 * <p/>
 * Provides constant values which must be accessible across the application.
 */
public class Constants
{
	
	/** English items that appear in navigation drawer */
	public static final String NAVIGATION_DRAWER_ITEMS_EN = {
			"Home",
			"Find",
			"Favoris",
			"Liens utile",
			"Informations des buses",
			"Accessibilité",
			"Boîte de nuit de campus",
			"Settings",
	};
	
	// TODO: translate to french
	/** French items that appear in navigation drawer */
	public static final String NAVIGATION_DRAWER_ITEMS_FR = {
			"Acceuil",
			"Chercher",
			"Favourites",
			"Useful Links",
			"Bus Information",
			"Accessibility",
			"Campus Hotspots",
			"Paramètres",
	}
	
	public static final byte NAVIGATION_ITEM_HOME = 0;
	public static final byte NAVIGATION_ITEM_FIND = 1;
	public static final byte NAVIGATION_ITEM_FAVOURITES = 2;
	public static final byte NAVIGATION_ITEM_USEFUL_LINKS = 3;
	public static final byte NAVIGATION_ITEM_BUS_INFO = 4;
	public static final byte NAVIGATION_ITEM_ACCESSIBILITY = 5;
	public static final byte NAVIGATION_ITEM_HOTSPOTS = 6;
	public static final byte NAVIGATION_ITEM_SETTINGS = 7;

    /**
     * Identifier for the preference which indicates the language selected
     * - English (true) or French (false)
     */
    public static final String PREF_LANGUAGE_SELECTED = "pref_global_lang_selected";
	
	// FRAGMENT CONSTANTS
	
	/** Identifies an instance of HomeFragment on the fragment backstack */
	public static final String FRAGMENT_HOME = "frag_home";
	/** Identifies an instance of FindFragment on the fragment backstack */
	public static final String FRAGMENT_FIND = "frag_find";
	/** Identifies an instance of FavouritesFragment on the fragment backstack */
	public static final String FRAGMENT_FAVOURITES = "frag_fave";
	/** Identifies an instance of LinksFragment on the fragment backstack */
	public static final String FRAGMENT_LINKS = "frag_links";
	/** Identifies an instance of BusInfoFragment on the fragment backstack */
	public static final String FRAGMENT_BUS_INFO = "frag_bus_info";
	/** Identifies an instance of AcessibilityFragment on the fragment backstack */
	public static final String FRAGMENT_ACCESSIBILITY = "frag_access";
	/** Identifies an instance of HotspotsFragment on the fragment backstack */
	public static final String FRAGMENT_HOTSPOTS = "frag_hot";
}
