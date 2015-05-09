package ca.josephroque.uottawacampusguide;

/**
 * Created by josephroque on 15-05-07.
 * <p/>
 * Provides constant values which must be accessible across the application.
 */
public class Constants
{

    // PREFERENCES
    /** Identifier for the shared preferences of the application */
    public static final String PREFERENCES = "ca.josephroque.uottawacampusguide";
    /** Identifier for the preference which indicates the language selected - English (true) or French (false) */
    public static final String PREF_LANG = "PL";

    //FRAGMENT IDENTIFIERS
    /** Identifier for instances of LanguageFragment on the back stack */
    public static final String FRAGMENT_LANGUAGE = "frag_language";
    /** Identifier for instances of FeatureFragment on the back stack */
    public static final String FRAGMENT_FEATURE = "frag_feature";

}
