package ca.josephroque.uottawacampusnavigator;

/**
 * Created by Joseph Roque on 15-05-24.
 * <p/>
 * Provides constant values which must be accessible across the application.
 */
public class Constants
{

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
