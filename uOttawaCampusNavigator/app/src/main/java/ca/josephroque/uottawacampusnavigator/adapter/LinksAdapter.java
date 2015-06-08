package ca.josephroque.uottawacampusnavigator.adapter;

import android.content.res.Resources;
import android.support.v7.widget.RecyclerView;
import android.util.Pair;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;

import ca.josephroque.uottawacampusnavigator.R;
import ca.josephroque.uottawacampusnavigator.util.DataFormatter;

/**
 * Created by Joseph Roque on 15-05-26.
 * <p/>
 * Manages the data displayed in a LinkFragment.
 */
public class LinksAdapter extends RecyclerView.Adapter<LinksAdapter.LinksViewHolder>
        implements View.OnClickListener
{
    /** Identifies output from this class in Logcat. */
    @SuppressWarnings("unused")
    private static final String TAG = "LanguageFragment";

    // Constant values

    /** Represents an item which references more links. */
    private static final byte TYPE_MORE_LINKS = 0;
    /** Represents an item which is a phone number. */
    private static final byte TYPE_PHONE_NUMBER = 1;
    /** Represents an item which is a hyperlink. */
    private static final byte TYPE_HYPERLINK = 2;
    /** Represents an item which returns to previous list. */
    private static final byte TYPE_RETURN = 3;

    // Objects

    /** Instance of callback interface. */
    private LinkAdapterCallback mCallback;

    // Arrays, data structures

    /** Array of names and values which will be displayed in the recycler view. */
    private String[] mLinkValues;

    // Primitive variables

    /** Indicates if this adapter was created from a previous LinkAdapter callback . */
    private boolean mHasParentList;
    /** Name of the parent list. */
    private String mParentList;
    /** Name of the current list. */
    private String mListName;

    /**
     * Gets an array for {@code mLinkValues} from resources based on linksArray.
     *
     * @param callback instance of callback interface
     * @param resources to get string arrays
     * @param linksArray which useful_links array will be used
     * @param hasParentList indicates if this fragment has a parent
     * @param parentList name of parent list or null if there isn't one
     * @param listName name of current list
     */
    public LinksAdapter(LinkAdapterCallback callback, Resources resources,
                        int linksArray, boolean hasParentList, String parentList, String listName)
    {
        switch (linksArray)
        {
            case 0:mLinkValues = resources.getStringArray(R.array.useful_links_0); break;
            case 1:mLinkValues = resources.getStringArray(R.array.useful_links_1); break;
            case 2:mLinkValues = resources.getStringArray(R.array.useful_links_2); break;
            case 3:mLinkValues = resources.getStringArray(R.array.useful_links_3); break;
            case 4:mLinkValues = resources.getStringArray(R.array.useful_links_4); break;
            case 5:mLinkValues = resources.getStringArray(R.array.useful_links_5); break;
            case 6:mLinkValues = resources.getStringArray(R.array.useful_links_6); break;
            case 7:mLinkValues = resources.getStringArray(R.array.useful_links_7); break;
            case 8:mLinkValues = resources.getStringArray(R.array.useful_links_8); break;
            case 9:mLinkValues = resources.getStringArray(R.array.useful_links_9); break;
            case 10:mLinkValues = resources.getStringArray(R.array.useful_links_10); break;
            case 11:mLinkValues = resources.getStringArray(R.array.useful_links_11); break;
            case 12:mLinkValues = resources.getStringArray(R.array.useful_links_12); break;
            case 13:mLinkValues = resources.getStringArray(R.array.useful_links_13); break;
            case 14:mLinkValues = resources.getStringArray(R.array.useful_links_14); break;
            case 15:mLinkValues = resources.getStringArray(R.array.useful_links_15); break;
            case 16:mLinkValues = resources.getStringArray(R.array.useful_links_16); break;
            case 17:mLinkValues = resources.getStringArray(R.array.useful_links_17); break;
            case 18:mLinkValues = resources.getStringArray(R.array.useful_links_18); break;
            case 19:mLinkValues = resources.getStringArray(R.array.useful_links_19); break;
            case 20:mLinkValues = resources.getStringArray(R.array.useful_links_20); break;
            case 21:mLinkValues = resources.getStringArray(R.array.useful_links_21); break;
            case 22:mLinkValues = resources.getStringArray(R.array.useful_links_22); break;
            case 23:mLinkValues = resources.getStringArray(R.array.useful_links_23); break;
            case 24:mLinkValues = resources.getStringArray(R.array.useful_links_24); break;
            case 25:mLinkValues = resources.getStringArray(R.array.useful_links_25); break;
            case 26:mLinkValues = resources.getStringArray(R.array.useful_links_26); break;
            case 27:mLinkValues = resources.getStringArray(R.array.useful_links_27); break;
            default:throw new IllegalArgumentException("Invalid links array: " + linksArray);
        }

        mHasParentList = hasParentList;
        mParentList = parentList;
        mListName = listName;
        mCallback = callback;
    }

    @Override
    public LinksViewHolder onCreateViewHolder(ViewGroup parent, int viewType)
    {
        View itemLayout = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.list_textview, parent, false);
        return new LinksViewHolder(itemLayout);
    }

    @Override
    public void onBindViewHolder(final LinksViewHolder viewHolder, final int position)
    {
        viewHolder.itemView.setOnClickListener(this);
        RelativeLayout.LayoutParams layoutParams =
                (RelativeLayout.LayoutParams) viewHolder.mImageViewIcon.getLayoutParams();
        layoutParams.addRule(RelativeLayout.CENTER_VERTICAL);

        // Adds header item to return to previous list, if there is a parent
        final byte positionOffset;
        if (mHasParentList)
        {
            if (position == 0)
            {
                viewHolder.itemView.setTag(Pair.create(TYPE_RETURN, 0));
                viewHolder.itemView.setBackgroundColor(viewHolder.itemView.getContext()
                        .getResources().getColor(R.color.primary_garnet));

                viewHolder.mImageViewIcon.setImageResource(R.drawable.ic_arrow_back);
                viewHolder.mTextViewTitle.setText(mListName);
                viewHolder.mTextViewSubtitle.setText(viewHolder.mTextViewSubtitle.getContext()
                        .getResources().getString(R.string.text_return_to) + " " + mParentList);
                return;
            }
            else
                positionOffset = 1;
        }
        else
            positionOffset = 0;

        String[] itemSplit = mLinkValues[position - positionOffset].split("~");
        viewHolder.mTextViewTitle.setText(itemSplit[0]);
        viewHolder.itemView.setBackgroundColor(viewHolder.itemView.getContext()
                .getResources().getColor(R.color.primary_gray));

        if (itemSplit[1].matches("\\d+"))
        {
            // Item links to a new list of links
            viewHolder.mImageViewIcon.setImageResource(R.drawable.ic_folder);
            viewHolder.mTextViewSubtitle.setText(R.string.text_view_links);
            viewHolder.itemView.setTag(Pair.create(TYPE_MORE_LINKS,
                    Pair.create(Integer.parseInt(itemSplit[1]), itemSplit[0])));
        }
        else if (itemSplit[1].charAt(0) == '#')
        {
            // Item is a phone number
            String phoneNumber = DataFormatter.formatPhoneNumber(itemSplit[1].substring(1));
            viewHolder.mImageViewIcon.setImageResource(R.drawable.ic_call);
            viewHolder.mTextViewSubtitle.setText(phoneNumber);
            viewHolder.itemView.setTag(Pair.create(TYPE_PHONE_NUMBER, phoneNumber));
        }
        else
        {
            // Item is a hyperlink
            viewHolder.mImageViewIcon.setImageResource(R.drawable.ic_link);
            viewHolder.mTextViewSubtitle.setText(itemSplit[1]);
            viewHolder.itemView.setTag(Pair.create(TYPE_HYPERLINK, itemSplit[1]));
        }
    }

    @Override
    public void onDetachedFromRecyclerView(RecyclerView recyclerView)
    {
        super.onDetachedFromRecyclerView(recyclerView);
        mCallback = null;
    }

    @Override
    public int getItemCount()
    {
        return mLinkValues.length + ((mHasParentList) ? 1 : 0);
    }

    @Override
    public void onClick(View view)
    {
        try
        {
            Pair<?, ?> pair = (Pair) view.getTag();

            switch ((Byte) pair.first)
            {
                case TYPE_MORE_LINKS:
                    if (mCallback != null)
                    {
                        // Invokes callback method to open next fragment
                        Pair<?, ?> secondPair = (Pair) pair.second;
                        int linksArray = ((Integer) secondPair.first);
                        String listName = secondPair.second.toString();
                        mCallback.openSublinks(linksArray, listName);
                    }
                    break;
                case TYPE_PHONE_NUMBER:
                    // Invokes callback method to open phone keypad
                    if (mCallback != null)
                        mCallback.promptCallPhoneNumber(pair.second.toString());
                    break;
                case TYPE_HYPERLINK:
                    // Invokes callback method to open link in browser
                    if (mCallback != null)
                        mCallback.openHyperlink(pair.second.toString());
                    break;
                case TYPE_RETURN:
                    // Invokes callback method to return to parent list
                    if (mCallback != null)
                        mCallback.moveUpList();
                    break;
                default:
                    throw new IllegalStateException("Type invalid");
            }
        }
        catch (ClassCastException ex)
        {
            throw new ClassCastException("Tag must be a pair with a type and value");
        }
    }

    /**
     * Callback interface to pass user interactions to fragment.
     */
    public interface LinkAdapterCallback
    {
        /**
         * Creates a new instance of LinksFragment with a new set of links.
         *
         * @param linksArray which useful_links array will be displayed
         * @param listTitle title of useful links array
         */
        void openSublinks(int linksArray, String listTitle);

        /**
         * Prompts user to open a hyperlink in a browser window.
         *
         * @param link hyperlink to open
         */
        void openHyperlink(String link);

        /**
         * Prompts user to call the specified phone number.
         *
         * @param phoneNumber number to call
         */
        void promptCallPhoneNumber(String phoneNumber);

        /**
         * Returns to previous useful_links list.
         */
        void moveUpList();
    }

    /**
     * Subclass of RecyclerView.ViewHolder to manage view which will display text to
     * the user.
     */
    public static class LinksViewHolder extends RecyclerView.ViewHolder
    {
        /** Displays title of the item. */
        private TextView mTextViewTitle;
        /** Displays subtitle of the item. */
        private TextView mTextViewSubtitle;
        /** Displays icon of the item. */
        private ImageView mImageViewIcon;

        /**
         * Gets references for member variables from {@code itemLayout} then passes
         * {@code itemLayout} to super constructor.
         *
         * @param itemLayout root layout of view holder
         */
        public LinksViewHolder(View itemLayout)
        {
            super(itemLayout);
            mTextViewTitle = (TextView) itemLayout.findViewById(R.id.tv_item_title);
            mTextViewSubtitle = (TextView) itemLayout.findViewById(R.id.tv_item_subtitle);
            mImageViewIcon = (ImageView) itemLayout.findViewById(R.id.iv_item_icon);
        }
    }
}
