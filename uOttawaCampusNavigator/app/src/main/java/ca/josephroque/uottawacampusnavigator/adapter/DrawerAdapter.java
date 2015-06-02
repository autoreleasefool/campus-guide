package ca.josephroque.uottawacampusnavigator.adapter;

import android.graphics.PorterDuff;
import android.support.v7.widget.RecyclerView;
import android.util.Log;
import android.util.Pair;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import java.util.TreeSet;

import ca.josephroque.uottawacampusnavigator.R;

/**
 * Created by Joseph Roque on 15-05-25.
 * <p/>
 * Manages data which will be displayed by the Navigation Drawer
 */
public class DrawerAdapter extends RecyclerView.Adapter<DrawerAdapter.DrawerViewHolder>
	implements View.OnClickListener
{

    /** Identifies output from this class in Logcat. */
    private static final String TAG = "DrawerAdapter";

    /** Indicates the type of the item is header. */
    private static final int TYPE_HEADER = 0;
    /** Indicates the type of the item is a regular item. */
    private static final int TYPE_ITEM = 1;
    /** Indicates the type of the item is a separator. */
    private static final int TYPE_SEPARATOR = 2;

    /** Instance of callback interface for user events. */
    private DrawerAdapterCallbacks mCallback;

    /** Array of image ids to display as icons for drawer items. */
    private int[] mArrayItemIcons;
	/** Array of colors to highlight selected icon */
	private int[] mArrayItemHighlights;
    /** Array of strings to display as names for drawer items. */
    private String[] mArrayItemNames;
    /** Set of positions which represent separators. */
    private TreeSet<Integer> mSetSeparators;

    /**
     * Assigns references to parameters
     *
     * @param callback instance of callback interface
     * @param itemIcons array of image ids
     * @param itemNames array of strings
     */
    public DrawerAdapter(DrawerAdapterCallbacks callback, int[] itemIcons, int[] itemHighlights, String[] itemNames)
    {
        this.mCallback = callback;
        this.mArrayItemIcons = itemIcons;
		this.mArrayItemHighlights = itemHighlights;
        this.mArrayItemNames = itemNames;
        mSetSeparators = new TreeSet<>();
    }

    @Override
    public DrawerViewHolder onCreateViewHolder(ViewGroup parent, int viewType)
    {
        View itemLayout;
        if (viewType == TYPE_HEADER)
        {
            itemLayout = LayoutInflater.from(parent.getContext())
                    .inflate(R.layout.header_navigation_drawer, parent, false);
        }
        else
        {
            itemLayout = LayoutInflater.from(parent.getContext())
                    .inflate(R.layout.list_navigation_drawer, parent, false);
        }
        return new DrawerViewHolder(itemLayout, viewType);
    }

    @Override
    public void onBindViewHolder(DrawerViewHolder viewHolder, final int position)
    {
        int viewType = getItemViewType(position);

        final byte typeOffset = getTypeOffset(position, false);
        final byte currentPosOffset = getTypeOffset(mCallback.getCurrentPosition(), true);

        switch (viewType)
        {
            case TYPE_HEADER:
                //do nothing
                break;

			case TYPE_SEPARATOR:
                viewHolder.mViewSeparator.setVisibility(View.VISIBLE);
                viewHolder.mImageViewItemIcon.setVisibility(View.GONE);
                viewHolder.mTextViewItemName.setVisibility(View.GONE);
                break;

            case TYPE_ITEM:
                viewHolder.mViewSeparator.setVisibility(View.GONE);
                viewHolder.mImageViewItemIcon.setVisibility(View.VISIBLE);
                viewHolder.mTextViewItemName.setVisibility(View.VISIBLE);

                viewHolder.mTextViewItemName.setText(mArrayItemNames[position - typeOffset]);
				
				// Set icon to the image resource given for this position if one was provided
				// otherwise, use a default image (settings)
				if (mArrayItemIcons.length > position - typeOffset)
				{
                    viewHolder.mImageViewItemIcon.setVisibility(View.VISIBLE);
					viewHolder.mImageViewItemIcon.setImageResource(mArrayItemIcons[position - typeOffset]);
				}
				else
				{
					viewHolder.mImageViewItemIcon.setVisibility(View.INVISIBLE);
					viewHolder.mImageViewItemIcon.setImageResource(R.drawable.ic_settings);
				}

				// Highlights the image if it is the currently selected item
				if (mArrayItemHighlights.length > position - typeOffset && mCallback != null
						&& position == mCallback.getCurrentPosition() + currentPosOffset)
				{
                    viewHolder.mImageViewItemIcon.setColorFilter(
                            mArrayItemHighlights[position - typeOffset], PorterDuff.Mode.MULTIPLY);
				}
				else
				{
					viewHolder.mImageViewItemIcon.clearColorFilter();
				}
				
				viewHolder.itemView.setTag(Pair.create(position, typeOffset));
                viewHolder.itemView.setOnClickListener(this);
                break;

            default:
                throw new IllegalStateException("Illegal value for view type: " + viewType);
        }
    }

    @Override
    public int getItemViewType(int position)
    {
		if (position == 0)
			return TYPE_HEADER;
        else if (mSetSeparators.contains(position))
            return TYPE_SEPARATOR;
        else
			return TYPE_ITEM;
    }

    @Override
    public int getItemCount()
    {
        return mArrayItemNames.length + 1 + mSetSeparators.size();
    }
	
	@SuppressWarnings("unchecked")
    @Override
	public void onClick(View src)
	{
		Pair<Integer, Byte> pair;
		try
		{
            pair = (Pair<Integer, Byte>) src.getTag();
		}
		catch (ClassCastException ex)
		{
			throw new ClassCastException("Tag must be a pair<int, byte> with a position and offset");
		}
		
		if (pair == null)
			return;
		
		final int position = pair.first;
		final byte typeOffset = pair.second;
		
		if (mCallback != null)
		{
			int lastPosition = mCallback.getCurrentPosition();
            lastPosition += getTypeOffset(lastPosition, true);
			if (position != lastPosition)
			{
				notifyItemChanged(lastPosition);
				notifyItemChanged(position);
			}
			mCallback.onDrawerItemClicked(position - typeOffset);
		}
	}

    private byte getTypeOffset(int position, boolean callback)
    {
        byte offset = 1;
        for (int i = 1; (i < position + offset) || (i <= position + offset && callback); i++)
        {
            if (getItemViewType(i) != TYPE_ITEM)
                offset++;
        }
        return offset;
    }

    /**
     * Adds a separator to the navigation drawer.
     * @param position position for new separator
     */
    public void addSeparator(int position)
    {
        int offset = getTypeOffset(position, false);
        mSetSeparators.add(position + offset);
    }

    /**
     * Removes a separator from the navigation drawer.
     * @param position position to remove separator from
     */
    public void removeSeparator(int position)
    {
        mSetSeparators.remove(position);
    }

    /**
     * Offers methods for sending events to the navigation drawer which uses this adapter.
     */
    public interface DrawerAdapterCallbacks
    {
        /**
         * Called when an item in the drawer is clicked, so the parent fragment can handle
         * the user interaction.
         * @param position view which was clicked.
         */
        void onDrawerItemClicked(int position);
		
		/**
		 * Should return the current item which is highlighted in the navigation drawer.
		 
		 * @return a value which indicates the current position in navigation.
		 */
		int getCurrentPosition();
    }

    /**
     * Subclass of RecyclerView.ViewHolder to manage view which will display an image
     * and text to the user.
     */
    public static class DrawerViewHolder extends RecyclerView.ViewHolder
    {
        /** ImageView for icon of list item. */
        private ImageView mImageViewItemIcon;
        /** TextView for name of list item. */
        private TextView mTextViewItemName;
		/** View to display an item separator */
		private View mViewSeparator;

        /**
         * Calls super constructor with {@code itemLayout} as parameter and gets references
         * for member variables from {@code itemLayou}.
         *
         * @param itemLayout root layout
         * @param viewType type of view holder
         */
        public DrawerViewHolder(View itemLayout, int viewType)
        {
            super(itemLayout);

            if (viewType != TYPE_HEADER)
            {
                mImageViewItemIcon = (ImageView) itemLayout.findViewById(R.id.iv_navigation_item_icon);
                mTextViewItemName = (TextView) itemLayout.findViewById(R.id.tv_navigation_item_name);
				mViewSeparator = itemLayout.findViewById(R.id.view_separator);
            }
        }
    }
}
